import { BaseCommandInteraction, Client, Interaction } from "discord.js";
import { Commands } from '../commands';


export default (client: Client): void  => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (interaction.isCommand() || interaction.isContextMenu()) {
            await handleSlashCommand(client, interaction);
        }
    })
}

const handleSlashCommand = async (client: Client, interaction: BaseCommandInteraction): Promise<void> => {
    const slashCommand = Commands.find(c => c.name === interaction.commandName)
    if (!slashCommand) {
        interaction.followUp({ content: "There is no command by that name!" });
        return;
    }

    await interaction.deferReply();
    slashCommand.run(client, interaction);
}