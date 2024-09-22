const { SlashCommandBuilder } = require('discord.js');

const { Configuration } = require('../../services/configuration.js');
const updateAllMemberRanks = require('../../helpers/updateAllMemberRanks.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('updateall')
        .setDescription(
            '[STAFF ONLY] [WARNING: THIS IS DEMANDING] Attempt to update all user cabbage counts!'
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        // Check if calling user is a member of staff (mod or CA)
        if (
            !interaction.member.roles.cache.some(
                (role) =>
                    role.id == Configuration.DISCORD_MOD_ROLE_ID ||
                    role.id == Configuration.DISCORD_CA_ROLE_ID
            )
        ) {
            await interaction.editReply(
                'Only members of staff can use this command!'
            );
            return;
        }

        await interaction.editReply(
            `Request received, attempting to update all member's cabbage counts.`
        );

        try {
            updateAllMemberRanks(interaction.client);
        } catch (error) {
            const logChannel = interaction.client.channels.cache.get(
                Configuration.LOG_CHANNEL_ID
            );
            logChannel.send(
                `${interaction.member.toString()}'s attempt to update all member's cabbage counts encountered an error.`
            );
            console.log(error);
            return;
        }

        return;
    },
};
