import {ApplicationCommandType, ChatInputCommandInteraction, Client, PermissionFlagsBits} from "discord.js";
import {Command} from '../command';
import { Comic } from "../models/comic";
import { GetEmbedRow, GetSummaryEmbed } from "../functions/DiscordUtil";

export const Followed: Command = {
    name: "followed",
    description: "Lists a user/channel followed comic. Must be admin for channel comics.",
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: ChatInputCommandInteraction) => {
        // If we are not in Direct Messages and user has admin perms. -> in server channel.
        if(!interaction.channel?.isDMBased() && interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)){
            // Send drop-down to decide whether to show mangas for the channel or user.
        } else{
            // The followed comics of the given channel.
            const FollowedComics = await GetFollowedComics((await interaction.user.createDM(true)).id);
            if(FollowedComics.length == 0) return interaction.followUp({ content: "You are not following any mangas!" });
            let titles: string[] = [];
            for(let i = 0; i < FollowedComics.length; i++){
                titles.push(FollowedComics[i].title);
            }

            if(titles.length > 10){
                // create pagination for embeds. pageCount = floor(titles.length / 10)
            }
            interaction.followUp({ embeds: [GetSummaryEmbed(titles, interaction.user.username)], components: [GetEmbedRow("0", {"0": 0}, 1, "unfollow")] });
        }
    }
}

// TODO: Research correct return typing and set it up correctly.
// TODO: Currently uses lean() to return a plain JS object.
const GetFollowedComics = async (channelID: string) => {
    return await Comic.find({ channels: channelID }).lean();
}

