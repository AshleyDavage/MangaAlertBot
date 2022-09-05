import { ApplicationCommandType, ChatInputCommandInteraction, Client, Embed, EmbedBuilder, EmbedData } from "discord.js";
import { FindMangaByTitle, Search } from "../functions/MangaAPI";
import { Command } from '../command';

// TODO: Setup pagination for the discord embeds to cycle through found manga
// TODO: Add "Save" button so the user can enable notifications on new chapters

export const Random: Command = {
    name: "random",
    description: "Searches for manga with given genres (returns 10 results) - */search action, survival*",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "genres",
            description: "List of genres to search for seperated by commas. (ex: action, survival)",
            type: 3,
            required: false
        },
        {
            name: "amount",
            description: "Amount of manga to return (max 50, default 10)",
            type: 3,
            required: false
        }
    ],
    run: async (client: Client, interaction: ChatInputCommandInteraction, time: number) => {
        const genres: any[] = ("" + interaction.options.get("genres")?.value).split(",");
        console.log(genres);

        // generate url
        let url: string = process.env.API_URL + `search?page=${Math.floor(Math.random() * 100)}&tachiyomi=true`
        let iterator: number = 1;

        // No genres selected
        if(genres.includes('undefined')){
            url = url;   
        } else { // Genres selected
            url += "&genres=";
            genres.forEach((genre: string) => {
                if(iterator === genres.length){
                    url += `${genre.trim().replace(" ", "-").toLowerCase()}`
                } else {
                    url += `${genre.trim().replace(" ", "-").toLowerCase()},`
                }
                iterator++;
            });
        }
        console.log(url);
        const randomMangas = await Search(url);

        let mangaEmbeds: any[] = [];

        for (let i = 0; i < randomMangas.length; i++) {
            mangaEmbeds.push(await mangaEmbedGenerator(await FindMangaByTitle(process.env.API_URL + `comic/${randomMangas[i].slug}?tachiyomi=true`)));
        }

        interaction.followUp({embeds: [mangaEmbeds[0]]});
    }
}

const mangaEmbedGenerator = async (manga: any) => {
    if(manga.comic.title === undefined) { return; }
    console.log(manga.comic.title);

    const embed = new EmbedBuilder()
        .setColor(7419530)
        .setTitle(manga.comic.title)
        .setURL(`${process.env.URL}/comic/${manga.comic.slug}`)
        .setDescription(manga.comic.desc)
        .setImage(manga.comic.cover_url)
        .setTimestamp()
        .setFooter({ text: 'Information from comick.fun' })

    if(manga.authors.length > 0){
        embed.setAuthor({ name: `Author: ${manga.authors[0].name}` })
    } else {
        embed.setAuthor({ name: `Author: Unknown` });
    }

    return embed;
}