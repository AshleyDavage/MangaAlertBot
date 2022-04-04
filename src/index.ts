import { Client } from 'discord.js';
import 'dotenv/config';

// Import Listeners
import ready from './listeners/ready';
import interactionCreate from './listeners/interactionCreate';

const client = new Client({
    intents:[]
});

// Register Listeners
ready(client);
interactionCreate(client);

client.login(process.env.TOKEN);