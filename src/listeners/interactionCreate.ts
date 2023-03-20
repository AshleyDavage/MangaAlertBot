import { Channel, ChatInputCommandInteraction, Client, Interaction, User } from "discord.js";
import { Commands } from '../commands';


// We create the interaction here
export default (client: Client): void  => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (interaction.isChatInputCommand()) {
            const timeTaken: number = Date.now();
            // This is when the slash command starts
            await handleSlashCommand(client, interaction, timeTaken);
        }
    })
}

const handleSlashCommand = async (client: Client, interaction: ChatInputCommandInteraction, time: number): Promise<void> => {
    const slashCommand = Commands.find(c => c.name === interaction.commandName)
    if (!slashCommand) {
        interaction.followUp({ content: "There is no command by that name!" });
        return;
    }

    await interaction.deferReply({ ephemeral: true});
    slashCommand.run(client, interaction, time);
}