DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
const updateAllMemberRanks = require('./helpers/updateAllMemberRanks');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Load all commands from dir/subdirs on start
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(
                `[WARNING] (RUN) The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    }
}

// Load all event handlers from dir on start
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.login(DISCORD_BOT_TOKEN);

// Schedule a job to run every Monday at 00:00 UTC to update all member's cabbage counts
cron.schedule(
    '0 0 * * 1',
    () => {
        console.log(
            `Running scheduled job to update all member's cabbage counts`
        );
        updateAllMemberRanks(client);
    },
    {
        scheduled: true,
        timezone: 'UTC',
    }
);
