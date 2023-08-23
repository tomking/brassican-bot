LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

const { Events, InteractionCollector } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(
                interaction.commandName
            );

            if (!command) {
                console.error(
                    `No command matching ${interaction.commandName} was found.`
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
            if (interaction.customId == 'completeRankUpdate') {
                await interaction.update('Clearing...');

                await interaction.message.delete();

                const logChannel =
                    interaction.client.channels.cache.get(LOG_CHANNEL_ID);
                logChannel.send(
                    `${interaction.member.toString()} marked the following complete:\n > "${interaction.message.toString()}"`
                );
            }
        } else if (interaction.isStringSelectMenu()) {
            // TODO
        }
    },
};
