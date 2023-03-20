import { Channel, ChatInputApplicationCommandData, ChatInputCommandInteraction, Client, User } from 'discord.js';

export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: ChatInputCommandInteraction, timeTaken: number) => void;
}