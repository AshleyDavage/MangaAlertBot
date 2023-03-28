// There should be a feed and a track option.
import { ApplicationCommandType, Channel, ChatInputCommandInteraction, Client, EmbedBuilder, User } from "discord.js";
import { Command } from '../command';
import { FindMangaByTitle, FindMangasWithFilters } from "../functions/MangaAPI";
import config from "../config.json";
import { GetEmbedRow, MangaEmbedGenerator } from "../functions/DiscordUtil";


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

        // TODO: This is the exact same functionality as Random -> Should export to embed generation function to avoid duplication.
        // Create the embeds
        let mangaEmbeds: EmbedBuilder[] = [];
        const pages = {} as {[key: string]: number};

        for(let i = 0; i < mangaArr.length; i++){
            const mangaContent = await FindMangaByTitle(config.API_URL + `comic/${mangaArr[i].slug}?tachiyomi=true`) || "err";
            mangaEmbeds.push(await MangaEmbedGenerator(mangaContent, timeTaken));
        }

        const time = 1000 * 60 * 5;
        const id = interaction.user.id;
        pages[id] = pages[id] || 0;

        const embed = mangaEmbeds[pages[id]];

        const collector = (await interaction.followUp({ embeds: [embed], components: [GetEmbedRow(id, pages)] })).createMessageComponentCollector({time});

        if(collector){
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
                } else if(btnInt.customId === 'next_embed' && pages[id] < mangaEmbeds.length - 1){
                    ++pages[id];
                } else if(btnInt.customId === 'track_manga_embed'){
                    // Setup tracking for this manga here.
                    // Current manga is mangaEmbeds[pages[id]]
                }

                interaction.editReply({ embeds: [mangaEmbeds[pages[id]]], components: [GetEmbedRow(id, pages)] });
            })
        }
    }
}
