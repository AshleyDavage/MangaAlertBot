import {BaseCommandInteraction, Client} from "discord.js";
import {Command} from '../command';

export const Ping: Command = {
    name: "ping",
    description: "Dispalys how long the bot takes to respond.",
    type: "CHAT_INPUT",
    run: async (client: Client, interaction: BaseCommandInteraction) => {
        await interaction.followUp({
            ephemeral: false,
            content: `Pong!`
        })
    }
}