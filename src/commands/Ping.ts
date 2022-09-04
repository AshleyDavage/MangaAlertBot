import { ApplicationCommandType, ChatInputCommandInteraction, Client } from "discord.js";
import { Command } from '../command';

export const Ping: Command = {
    name: "ping",
    description: "Displays how long the bot takes to respond.",
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: ChatInputCommandInteraction, time: number) => {
        const content = `Pong! Took ${Date.now() - time}ms to respond.`;
        await interaction.followUp({
            content
        })
    }
}