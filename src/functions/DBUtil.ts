import { IComic, Comic } from "../models/comic";
import { FindMangaByTitle } from "./MangaAPI";

// Gets all the comics that are tracked by the given Channel ID.
export const GetFollowedComics = async (channelID: string): Promise<IComic[]> => {
    return await Comic.find({ channels: channelID }).lean();
}

/**
 * 
 * @param {string} hid The title of the comic to be tracked.
 * @param {string} channelID The id of the channel to be notified.
 */
export const AddChannelToTrackedComic = async (hid: string, channelID: string) => {
    console.log(`MangaHID: ${hid}, channelID: ${channelID}`);
    
    if(await Comic.exists({  hid })){
        if(!await Comic.exists({ hid, channels: channelID })){
            await Comic.find({ hid }).updateOne({ $push: { channels: channelID } });
            return;
        }
    } else {
        const manga = await FindMangaByTitle(hid);
        if(manga === null) {
            console.error(`[UpdateTrackedManga] Error finding manga via identifier: ${hid}\nManga:\n${manga}`);
            return;
        };

        let newManga = {
            title: manga.comic.title,
            latestChapter: manga.comic.last_chapter,
            imageURL: manga.comic.cover_url,
            description: "No description available.",
            author: manga.authors[0].name,
            channels: [channelID],
            slug: manga.comic.slug,
            hid: manga.comic.hid   
        }

        if(manga.comic.desc != null){
            newManga.description = manga.comic.desc.replace(/<[^>]*>?/gm, '').substring(0, 200);
        }

        Comic.create(newManga);        
    }
}

export const RemoveChannelFromTrackedComic = async (hid: string, channelID: string) => {
    await Comic.find({ hid }).updateOne({ $pull: { channels: channelID } });
}