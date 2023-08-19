const { Client, Events, GatewayIntentBits } = require('discord.js');

DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(token);
