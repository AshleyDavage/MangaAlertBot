import mongoose from 'mongoose';
import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

// Import Listeners
import ready from './listeners/ready';
import interactionCreate from './listeners/interactionCreate';

const client = new Client({
    intents:[
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions
    ]
});

// Register Listeners
ready(client);
interactionCreate(client);

client.login(process.env.TOKEN);

mongoose.connect(<string> process.env.DB_URI).then(() => console.log('Connected to database'));




