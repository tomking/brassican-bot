import { Events, TextChannel } from 'discord.js';

import { Environment } from '../services/environment.ts';

export const name = Events.InteractionCreate;

export const execute = async (interaction: any) => {
    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(
            interaction.commandName,
        );

        if (!command) {
            console.error(
                `No command matching ${interaction.commandName} was found.`,
            );
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    } else if (interaction.isButton()) {
        if (interaction.customId === 'completeRankUpdate') {
            await interaction.update('Clearing...');

            await interaction.message.delete();

            const logChannel = interaction.client.channels.cache.get(
                Environment.LOG_CHANNEL_ID,
            ) as TextChannel;

            logChannel.send(
                `${interaction.member.toString()} marked the following complete: \n    "${interaction.message.toString()}"`,
            );
        }
    } else if (interaction.isStringSelectMenu()) {
        // TODO
    }
};
