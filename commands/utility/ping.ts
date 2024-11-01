import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Wondering if the servers are on fire?');

export const execute = async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply({
        content:
            `Pong! (Websocket heartbeat: ${interaction.client.ws.ping}ms.)`,
        ephemeral: true,
    });
};
