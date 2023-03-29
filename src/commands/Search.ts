// There should be a feed and a track option.
import { ApplicationCommandType, ChatInputCommandInteraction, Client, EmbedBuilder } from "discord.js";
import { Command } from '../command';
import { FindMangasWithFilters } from "../functions/MangaAPI";
import config from "../config.json";
import { GetEmbedPagination, GetEmbedRow, } from "../functions/DiscordUtil";


export const Search: Command = {
    name: "search",
    description: "A command to search for a manga by specific name. Returns a group of manga that match.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "name",
            description: "Input the name of the manga",
            type: 3,
            required: true
        }
    ],
    run: async (client: Client, interaction: ChatInputCommandInteraction, timeTaken: number) => {
        const title = interaction.options.get("name")?.value?.toString().trim().toLowerCase();
        const errMessage: string = "There was an error finding a manga by that name!\nTry again or contact the developer if the problem persists.";
        if(title === undefined) return interaction.followUp({ content: errMessage });

        // Get the mangas that match the given title.
        let mangaArr = await FindMangasWithFilters(config.API_URL + `v1.0/search?q=${title}&tachiyomi=true`);
        if(mangaArr.length == 0) return interaction.followUp({ content: "Couldn't find any mangas with that title!" });

        const id = interaction.user.id;
        const { collector, embeds, pages } = await GetEmbedPagination(mangaArr, interaction); 

        // If the collector exists
        if(collector){
            // On the collect event handle the button interaction.
            collector.on('collect', btnInt => {
                if (!btnInt){
                    return
                }
    
                btnInt.deferUpdate();    

                if(btnInt.customId !== 'previous_embed' && btnInt.customId !== 'next_embed' && btnInt.customId !== 'track_manga_embed'){
                    return
                }

                if(btnInt.customId === 'previous_embed' && pages[id] > 0){
                    --pages[id];
                } else if(btnInt.customId === 'next_embed' && pages[id] < embeds.length - 1){
                    ++pages[id];
                } else if(btnInt.customId === 'track_manga_embed'){
                    // Setup tracking for this manga here.
                    // Current manga is mangaEmbeds[pages[id]]
                }

                console.log(pages[id] + " pages: " + pages);

                interaction.editReply({ embeds: [embeds[pages[id]]], components: [GetEmbedRow(id, pages, embeds.length)] });
            })
        }
    }
}
