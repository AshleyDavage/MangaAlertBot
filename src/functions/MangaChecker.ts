// TODO: This is a co-routine that should run at all times to keep checking whether there is a new chapter.
// If there is a difference between the data we should output the latest information to the specified feeds/users.

import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { Comic, IComic } from "../models/comic";
import { NewChapterEmbed } from "./DiscordUtil";
import { GetLatestChapters } from "./MangaAPI";

let latestUpdateHID = "";

export const MangaChecker = async (client: Client) => {
    const allLatestComics = await GetLatestChapters();
    let newComics: any[] = [];
    for(const comic of allLatestComics){
        if(comic.md_comics.hid === latestUpdateHID){
            break;
        }
        newComics.push(comic);
    }
    

    // console.log(`${allLatestComics.length}\n${newComics.length}`);

    if (!newComics.length) {
        return;
    }

    const currentTrackedComics = await Comic.find({ hid: { $in: newComics.map((comic: any) => comic.md_comics.hid) } });

    // console.log(currentTrackedComics.length);
    await Promise.all(currentTrackedComics.map(async (trackedComic) => {
        for (const newComic of newComics) {
            if (trackedComic.latestChapter !== undefined) {
                const currentChapter = parseInt(trackedComic.latestChapter);
                if (trackedComic.title === newComic.md_comics.title && currentChapter < parseInt(newComic.chap)) {
                    await Comic.findOneAndUpdate({ hid: newComic.md_comics.hid }, { latestChapter: newComic.chap });
                    console.log(`New chapter found for ${trackedComic.title}!`);
                    const embed = await NewChapterEmbed(newComic)
                    for(const channel of trackedComic.channels){
                        const channelObj = await client.channels.fetch(channel);
                        (channelObj as TextChannel).send({ embeds: [embed] });
                    }
                }
            }
        }
    }));

    latestUpdateHID = allLatestComics[0].md_comics.hid;
}