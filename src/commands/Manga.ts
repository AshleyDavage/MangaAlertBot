// TODO: Add /manga command functionality
// There should be a feed and a track option.
import {BaseCommandInteraction, Client} from "discord.js";
import {Command} from '../command';

export const Manga: Command = {
    name: "manga",
    description: "A command to select a manga that should be tracked by a user or fed to a channel",
    type: "CHAT_INPUT",
    options: [],
    run: async (client: Client, interaction: BaseCommandInteraction, time: number) => {
        // TODO: Research best way to implement sub-command interactions
    }
}