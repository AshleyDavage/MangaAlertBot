import { ApplicationCommandType, ChatInputCommandInteraction, Client, PermissionFlagsBits } from "discord.js";
import { Command } from "../command";
import { GetFollowedComics, RemoveChannelFromTrackedComic } from "../functions/DBUtil";
import { GetFollowDropDownMenu } from "../functions/DiscordUtil";

export const Unfollow: Command = {
    name: "unfollow",
    description: "Unfollow the given comic(s) by follow list ID(s).",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "ids",
            description: "Input the ID(s) of the comic(s) you want to unfollow.",
            type: 3,
            required: true
        }
    ],
    run: async (client: Client, interaction: ChatInputCommandInteraction) => {
        const ids: string[] = interaction.options.getString("ids")?.split(",") || [];

        let collector;

        if(!interaction.channel?.isDMBased() && interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)){
            const { string_select_menu_builder } = GetFollowDropDownMenu();
            const time: number = 1000 * 60 * 5;

            collector = (await interaction.followUp({
                content: `Select which channel you want to unfollow the comic(s) from.`,
                embeds: [],
                components: [string_select_menu_builder]
            })).createMessageComponentCollector({ time: time });
        } else {
            const followedComics = await GetFollowedComics((await interaction.user.createDM(true)).id);
            let unfollowedComics = "";
            for(let i = 0; i < ids.length; ++i){
                const id = parseInt(ids[i].trim());
                if(id > followedComics.length || id < 1) continue;
                await RemoveChannelFromTrackedComic(followedComics[id - 1].hid, interaction.channelId)
                unfollowedComics += `${followedComics[id - 1].title}\n`;
            }
            // Send message to user with the list of unfollowed comics.
            interaction.followUp({ content: `Unfollowed the following comics:\n${unfollowedComics}` });
        }

        if(!collector) return;
        collector.on('collect', async embedInt => {
            if(!embedInt)   return;
            embedInt.deferUpdate();

            if(embedInt.isStringSelectMenu()) { 
                const selected = embedInt.values[0];
                if(selected === "dm") {
                    const channel = (await interaction.user.createDM(true)).id;
                    const followedComics = await GetFollowedComics(channel);
                    let unfollowedComics = "";
                    for(let i = 0; i < ids.length; ++i){
                        const id = parseInt(ids[i].trim());
                        if(id > followedComics.length || id < 1) continue;
                        await RemoveChannelFromTrackedComic(followedComics[id - 1].hid, channel);
                        unfollowedComics += `${followedComics[id - 1].title}\n`;
                    }
                    // Send message to user with the list of unfollowed comics.
                    interaction.editReply({ content: `${interaction.user.username}'s unfollowed the following comics:\n${unfollowedComics}` });
                } else if(selected === "channel") {
                    const followedComics = await GetFollowedComics(interaction.channelId);
                    let unfollowedComics = "";
                    for(let i = 0; i < ids.length; ++i){
                        const id = parseInt(ids[i].trim());
                        if(id > followedComics.length || id < 1) continue;
                        await RemoveChannelFromTrackedComic(followedComics[id - 1].hid, interaction.channelId)
                        unfollowedComics += `${followedComics[id - 1].title}\n`;
                    }
                    // Send message to user with the list of unfollowed comics.
                    interaction.editReply({ content: `The Channel has unfollowed these comics:\n${unfollowedComics}` });
                }
            }
        })
    }
}