import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, Channel, ChatInputCommandInteraction, Client, Embed, EmbedBuilder, EmbedData, Interaction, User } from "discord.js";
import { FindMangaByTitle, FindMangasWithFilters } from "../functions/MangaAPI";
import { Command } from '../command';
import config from '../config.json';
import { MangaEmbedGenerator, GetEmbedRow } from "../functions/DiscordUtil";

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
    run: async (client: Client, interaction: ChatInputCommandInteraction, timeTaken: number) => {
        const genres: any[] = ("" + interaction.options.get("genres")?.value).split(",");

        // generate url
        let url: string = config.API_URL + `v1.0/search?page=${Math.floor(Math.random() * 100)}&tachiyomi=true`

        // No genres selected
        if(genres.includes(null)){
            url = url;   
        } else { // Genres selected
            url += "&genres=";
            for(let i = 0; i < genres.length; i++){
                url += `${genres[i].trim().replace(" ", "-").toLowerCase()}`
                if(i < genres.length - 1){
                    url += ","
                }
            }
        }
        const randomMangas = await FindMangasWithFilters(url);

        // TODO: This is the exact same functionality as Search -> Should export to embed generation function to avoid duplication.      
        let mangaEmbeds: EmbedBuilder[] = [];
        const pages = {} as { [key: string]: number }

        for (let i = 0; i < randomMangas.length; i++) {
            const mangaContent = await FindMangaByTitle(config.API_URL + `comic/${randomMangas[i].slug}?tachiyomi=true`) || "err";
            mangaEmbeds.push(await MangaEmbedGenerator(mangaContent, timeTaken));
        }

        // Pagination for embeds
        const time = 1000 * 60 * 5;

        const id = interaction.user.id;
        pages[id] = pages[id] || 0;

        const embed = mangaEmbeds[pages[id]];

        // we await the followUp so we can create a message component collector on it
        // this ensures the button presses are for unique messages rather than all of them.
        const collector = (await interaction.followUp({ embeds: [embed], components: [GetEmbedRow(id, pages)] })).createMessageComponentCollector({time});

        // If the message collector was created.
        if(collector) {
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