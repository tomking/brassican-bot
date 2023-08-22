const { SlashCommandBuilder } = require('discord.js');
const models = require('../../models');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cabbages')
        .setDescription('Get your current cabbage count!'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const discordID = interaction.user.id;

        // Get user's information
        let memberData;
        try {
            memberData = await models.Member.findOne({
                discordID: discordID,
            });

            if (!memberData) {
                await interaction.editReply(
                    "You aren't registered yet. Use `/register` to get signed up!"
                );
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

        await interaction.editReply(
            `You currently have: ${Math.floor(
                memberData.currentCabbages
            )} cabbages! Your current rank is: ${memberData.currentRank}!`
        );

        return;
    },
};
