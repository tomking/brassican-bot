const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Wondering if the servers are on fire?'),
    async execute(interaction) {
        await interaction.reply(
            `Pong! (Websocket heartbeat: ${interaction.client.ws.ping}ms.)`
        );
    },
};
