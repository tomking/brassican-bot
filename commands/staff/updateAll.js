LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
DISCORD_MOD_ROLE_ID = process.env.DISCORD_MOD_ROLE_ID;
DISCORD_CA_ROLE_ID = process.env.DISCORD_CA_ROLE_ID;

const { SlashCommandBuilder } = require('discord.js');
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
                    role.id == DISCORD_MOD_ROLE_ID ||
                    role.id == DISCORD_CA_ROLE_ID
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
            const logChannel =
                interaction.client.channels.cache.get(LOG_CHANNEL_ID);
            logChannel.send(
                `${interaction.member.toString()}'s attempt to update all member's cabbage counts encountered an error.`
            );
            console.log(error);
            return;
        }

        return;
    },
};
