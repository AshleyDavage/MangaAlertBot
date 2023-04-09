import {ApplicationCommandType, ChatInputCommandInteraction, Client, EmbedBuilder, PermissionFlagsBits, TextInputBuilder} from "discord.js";
import {Command} from '../command';
import { Comic, IComic } from "../models/comic";
import { GetEmbedRow, GetFollowDropDownMenu, GetFollowedListEmbeds } from "../functions/DiscordUtil";
import { GetFollowedComics } from "../functions/DBUtil";

export const Followed: Command = {
    name: "followed",
    description: "Lists a user/channel followed comic. Must be admin for channel comics.",
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: ChatInputCommandInteraction) => {
        const pages: {[key: string]: number} = {};
        const time: number = 1000 * 60 * 5;
        // = await GetFollowedComics((await interaction.user.createDM())?.id);
    
        // = await GetFollowedListEmbeds(followedComics, interaction.user.username);
        const id: string = interaction.user.id;
        pages[id] = pages[id] || 0;

        let isMenu = false;

        let collector;

        let embeds: EmbedBuilder[] = [];
        let followedComics: IComic[] = [];

        // If we are not in Direct Messages and user has admin perms. -> in server channel.
        if(!interaction.channel?.isDMBased() && interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)){
            // Send drop-down to decide whether to show mangas for the channel or user.
            const menu = GetFollowDropDownMenu();
            isMenu = true;
            collector = (await interaction.followUp({
                content: `Select which type of follow list to view.`,
                embeds: [],
                components: [menu.string_select_menu_builder]
            })).createMessageComponentCollector({ time: time });
        } else{
            followedComics = await GetFollowedComics((await interaction.user.createDM())?.id);
            if(followedComics.length == 0) return interaction.followUp({ content: "You are not following any comics!" });
            embeds = await GetFollowedListEmbeds(followedComics, interaction.user.username);
            collector = (await interaction.followUp({ 
                content: "Use the /unfollow command followed by the below ID(s) to remove the comic.", 
                embeds: [embeds[pages[id]]], 
                components: [GetEmbedRow(id, pages, embeds.length, "unfollow")], 
            })).createMessageComponentCollector({ time: time });
        }
        
        if(collector){
            collector.on('collect', async embedInt => {
                if(!embedInt) return;
                embedInt.deferUpdate();
    
                if(embedInt.isStringSelectMenu()){
                    const selected = embedInt.values[0];
                    
                    if(selected === "dm"){
                        followedComics = await GetFollowedComics((await interaction.user.createDM())?.id);
                        if(followedComics.length == 0) {
                            interaction.followUp({ content: "You are not following any comics!" });
                            return;
                        }
                        embeds = await GetFollowedListEmbeds(followedComics, interaction.user.username);
                    } else if(selected === "channel"){
                        followedComics = await GetFollowedComics(interaction.channelId);
                        if(followedComics.length == 0) {
                            interaction.editReply({ content: "This channel is not following any comics!" });
                            return;
                        }
                        embeds = await GetFollowedListEmbeds(followedComics, "This channel");
                    }

                    interaction.editReply({ embeds: [embeds[pages[id]]], components: [GetEmbedRow(id, pages, embeds.length, "unfollow")] });
                    isMenu = false;
                }

                if(embedInt.customId !== 'previous_embed' && embedInt.customId !== 'next_embed' && embedInt.customId !== 'unfollow_manga'){
                    return
                }
    
                if(embedInt.customId === 'previous_embed' && pages[id] > 0){
                    --pages[id];
                } else if (embedInt.customId === 'next_embed' && pages[id] < embeds.length - 1){
                    ++pages[id];
                } else if (embedInt.customId === 'unfollow_manga'){
                    // User presses unfollow.
                    return;
                }

                if(!isMenu){
                    interaction.editReply({ embeds: [embeds[pages[id]]], components: [GetEmbedRow(id, pages, embeds.length, "unfollow")] });                    
                }        
            })
        }  
    }
}