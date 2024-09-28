const { SlashCommandBuilder } = require('discord.js');

const { Environment } = require('../../services/environment');
const updateMemberRank = require('../../helpers/updateMemberRank.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('[STAFF ONLY] Attempt to update user cabbage count!')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('The member to update')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        // Check if calling user is a member of staff (mod or CA)
        if (
            !interaction.member.roles.cache.some(
                (role) =>
                    role.id == Environment.DISCORD_MOD_ROLE_ID ||
                    role.id == Environment.DISCORD_CA_ROLE_ID
            )
        ) {
            await interaction.editReply(
                'Only members of staff can use this command!'
            );
            return;
        }

        await interaction.editReply(
            `Request received, attempting to update member's cabbage count.`
        );

        const discordID = interaction.options.getUser('user').id;

        try {
            updateMemberRank(discordID, interaction.client);
        } catch (error) {
            const logChannel = interaction.client.channels.cache.get(
                Environment.LOG_CHANNEL_ID
            );

            logChannel.send(
                `${interaction.member.toString()}'s attempt to update ${interaction.options
                    .getUser('user')
                    .toString()}'s cabbage count encountered an error.`
            );
            console.log(error);
            await interaction.editReply(
                `The attempt to update member's cabbage count encountered an error.`
            );
            return;
        }
        await interaction.editReply(
            `Member's cabbage count was succesfully updated.`
        );
        return;
    },
};
