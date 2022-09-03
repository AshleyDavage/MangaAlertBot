import {BaseCommandInteraction, Client} from "discord.js";
import {Command} from '../command';

export const Ping: Command = {
    name: "ping",
    description: "Displays how long the bot takes to respond.",
    type: "CHAT_INPUT",
    run: async (client: Client, interaction: BaseCommandInteraction, time: number) => {
        const content = `Pong! Took ${Date.now() - time}ms to respond.`;
        await interaction.followUp({
            content
        })
    }
}