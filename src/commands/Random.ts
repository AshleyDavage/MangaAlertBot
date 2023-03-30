import { ApplicationCommandType, ChatInputCommandInteraction, Client, EmbedBuilder } from "discord.js";
import { FindMangaByTitle, FindMangasWithFilters } from "../functions/MangaAPI";
import { Command } from '../command';
import config from '../config.json';
import { GetMangaEmbed, GetEmbedRow, GetEmbedPagination, GetFollowDropDownMenu, UpdateTrackedManga } from "../functions/DiscordUtil";

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

        // Pagination for embeds
        const id = interaction.user.id;
        const { collector, embeds, pages } = await GetEmbedPagination(randomMangas, interaction); 

        let followMenu: boolean = false;

        // If the message collector was created.
        if(collector) {
            collector.on('collect', async embedInt => {
                if (!embedInt){
                    return
                }
    
                embedInt.deferUpdate();    

                if(embedInt.isStringSelectMenu()){
                    const mangaTitle: string | undefined = embeds[pages[id]].data.title;
                    if(mangaTitle === undefined) return;
                    if(embedInt.values[0] == 'dm'){
                        UpdateTrackedManga(mangaTitle, (await interaction.user.createDM(true)).id)                        
                        interaction.editReply({content: `You will now receive notifications for ${mangaTitle} in your DMs.`});
                    } else if(embedInt.values[0] == 'channel'){
                        UpdateTrackedManga(mangaTitle, interaction.channelId);
                        interaction.editReply({content: `You will now receive notifications for ${mangaTitle} in this channel.`});
                    }
                }

                if(embedInt.customId !== 'previous_embed' && embedInt.customId !== 'next_embed' && embedInt.customId !== 'follow_manga_embed' && embedInt.customId !== 'close_follow_menu'){
                    return
                }

                if(embedInt.customId === 'previous_embed' && pages[id] > 0){
                    --pages[id];
                } else if(embedInt.customId === 'next_embed' && pages[id] < embeds.length - 1){
                    ++pages[id];
                } else if(embedInt.customId === 'follow_manga_embed'){
                    const dropdown = GetFollowDropDownMenu();

                    followMenu = true;
                    interaction.editReply({ 
                        content: `Select where you would like to receive notifications for ${embeds[pages[id]].data.title}.`, 
                        embeds: [], 
                        components: [dropdown.string_select_menu_builder, dropdown.return_button_builder]
                    });
                } else if(embedInt.customId === 'close_follow_menu'){
                    followMenu = false;
                }

                if(!followMenu){
                    interaction.editReply({ embeds: [embeds[pages[id]]], components: [GetEmbedRow(id, pages, embeds.length)] });
                }
            })
        }
    }
}