LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
DISCORD_MOD_ROLE_ID = process.env.DISCORD_MOD_ROLE_ID;
DISCORD_CA_ROLE_ID = process.env.DISCORD_CA_ROLE_ID;

const { SlashCommandBuilder } = require('discord.js');
const models = require('../../models');
const updateMemberRank = require('../../helpers/updateMemberRank.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('givecabbages')
        .setDescription('[STAFF ONLY] Give a user bonus cabbages!')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('The member to give cabbages to')
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName('quantity')
                .setDescription('The number of cabbages to give')
                .setRequired(true)
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

        const discordID = interaction.options.getUser('user').id;

        // Check if user is already registered with this discord ID
        let memberData;
        try {
            memberData = await models.Member.findOne({
                discordID: discordID,
            });

            if (!memberData) {
                await interaction.editReply('User is not registered!');
                return;
            }
        } catch (error) {
            console.error(
                'Error checking if discord ID is already registered: ',
                error
            );
            await interaction.editReply(
                'Something went wrong. Please try again.'
            );
            return;
        }

        memberData.itemizedCabbages.extra +=
            interaction.options.getInteger('quantity');

        await memberData.save();

        await interaction.editReply(
            `${interaction.options
                .getUser('user')
                .toString()} has been awarded ${interaction.options.getInteger(
                'quantity'
            )} cabbages! `
        );

        updateMemberRank(discordID, interaction.client);

        // Send log message
        const logChannel =
            interaction.client.channels.cache.get(LOG_CHANNEL_ID);
        logChannel.send(
            `${interaction.options
                .getUser('user')
                .toString()} has been awarded ${interaction.options.getInteger(
                'quantity'
            )} cabbages by ${interaction.member.toString()}`
        );

        return;
    },
};
