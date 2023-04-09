import mongoose from 'mongoose';
import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

// Import Listeners
import ready from './listeners/ready';
import interactionCreate from './listeners/interactionCreate';
import { MangaChecker } from './functions/MangaChecker';

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

setInterval(async () => {
    console.log(`Checking for new chapters at ${new Date().toLocaleTimeString()}`);
    await MangaChecker(client);
    console.log(`Finished checking for new chapters at ${new Date().toLocaleTimeString()}`);
}, 300000);