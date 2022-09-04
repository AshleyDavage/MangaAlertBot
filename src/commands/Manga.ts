// TODO: Add /manga command functionality
// There should be a feed and a track option.
import { ApplicationCommandType, ChatInputCommandInteraction, Client } from "discord.js";
import { Command } from '../command';
import { MangaSearch } from "../functions/MangaSearch";

// TODO: Split functionality across multiple commands
// TODO: Remove Tracker only need Alert and would simplify things.


export const Manga: Command = {
    name: "manga",
    description: "A command to select a manga that should be tracked by a user or fed to a channel",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "mode",
            description: "Input the mode: 'search', 'track', 'alert'.",
            type: 3,
            required: true
        }, 
        {
            name: "name",
            description: "Input the name of the manga",
            type: 3,
            required: true
        }
    ],
    run: async (client: Client, interaction: ChatInputCommandInteraction, time: number) => {
        const mode = interaction.options.get("mode")?.value;
        const name = interaction.options.get("name")?.value;
    
        const errMessage: string = "There was an error finding a manga by that name!\nTry again or contact the developer if the problem persists.";

        let mangaArr: any[] = [];

        switch(mode){
            case "search":
                if(name === undefined) { return interaction.followUp({ content: errMessage }); }
                mangaArr = await MangaSearch(("" + name).toLowerCase());
                // TODO: format the response.


                // TODO: follow up with the interaction
                interaction.followUp({
                    content: "f"//mangaArr[0].cover_url
                })
                break;
            case "track":
                // Run track function
                break;
            case "alert":
                // Run alert function
                break;
            default:
                console.log("User somehow broke the manga command.");
        }
    }
}