import { ApplicationCommandType, ChatInputCommandInteraction, Client } from "discord.js";
import { MangaSearch } from "src/functions/MangaSearch";
import { Command } from '../command';

// TODO: Setup discord embeds for the received data from the mangaSearch function
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
        }
    ],
    run: async (client: Client, interaction: ChatInputCommandInteraction, time: number) => {
        const genres: string[] = ("" + interaction.options.get("genres")?.value).split(",");

        // generate url
        let url: string = `https://api.comick.fun/search?page=${Math.random() * 100 + 1}&genres=`
        let iterator: number = 1;
        genres.forEach((genre: string) => {
            if(iterator === genres.length){
                url += `${genre}`
            } else {
                url += `${genre},`
            }
            iterator++;
        });
        const data: any[] = await MangaSearch(url);

        await interaction.followUp({

        });

    }
}