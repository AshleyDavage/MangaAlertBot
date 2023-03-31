// There should be a feed and a track option.
import { ActionRowBuilder, ApplicationCommandType, ChatInputCommandInteraction, Client, EmbedBuilder, PermissionFlagsBits, StringSelectMenuBuilder, TextChannel } from "discord.js";
import { Command } from '../command';
import { FindMangasWithFilters } from "../functions/MangaAPI";
import config from "../config.json";
import { GetEmbedPagination, GetEmbedRow, GetFollowDropDownMenu, UpdateTrackedManga, } from "../functions/DiscordUtil";

const placeholder: string[] = ['884221594736656414', '729443933511483495', '744196929931575307'];

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

        const id: string = interaction.user.id;
        const { collector, embeds, pages } = await GetEmbedPagination(mangaArr, interaction); 

        let followMenu: boolean = false;

        // If the collector exists
        if(collector){
            // On the collect event handle the button interaction.
            collector.on('collect', async embedInt => {
                if (!embedInt){
                    return
                }

                const mangaTitle: string | undefined = embeds[pages[id]].data.title;

                embedInt.deferUpdate();    

                if(embedInt.isStringSelectMenu()){
                    if(mangaTitle === undefined) return;
                    if(embedInt.values[0] == 'dm'){
                        UpdateTrackedManga(mangaArr[pages[id]].slug, (await interaction.user.createDM(true)).id)                        
                        interaction.editReply({content: `You will now receive notifications for ${mangaTitle} in your DMs.`});
                    } else if(embedInt.values[0] == 'channel'){
                        UpdateTrackedManga(mangaArr[pages[id]].slug, interaction.channelId);
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
                    if(!interaction.channel?.isDMBased() && interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)){
                        const dropdown = GetFollowDropDownMenu();

                        followMenu = true;
                        interaction.editReply({ 
                            content: `Select where you would like to receive notifications for ${embeds[pages[id]].data.title}.`, 
                            embeds: [], 
                            components: [dropdown.string_select_menu_builder, dropdown.return_button_builder]
                        });
                    } else {
                        if(mangaTitle === undefined) return;
                        UpdateTrackedManga(mangaArr[pages[id]].slug, (await interaction.user.createDM(true)).id)
                    }
                } else if(embedInt.customId === 'close_follow_menu'){
                    followMenu = false;
                }

                if(!followMenu){
                    interaction.editReply({ embeds: [embeds[pages[id]]], components: [GetEmbedRow(id, pages, embeds.length, "follow")] });
                }
            })
        }
    }
}
