const { SlashCommandBuilder } = require('discord.js');
const models = require('./models');
const womClient = require('./config/wom.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register for the Bekt clan rank system!')
        .addStringOption((option) =>
            option
                .setName('rsn')
                .setDescription(
                    'The current account name of your main OSRS account'
                )
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const rsn = interaction.options.getString('rsn');
        const discordID = interaction.user.id;

        // Check if user is already registered with this discord ID
        try {
            const memberFromDiscordID = await models.Member.findOne({
                discordID: discordID,
            });

            if (memberFromDiscordID) {
                await interaction.editReply('You are already registered!');
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

        // Get user info from WOM
        try {
            const womResult = await womClient.players.getPlayerDetails(rsn);
            if (!womResult) {
                await interaction.editReply('The given RSN is invalid!');
                return;
            }
            const womID = womResult.id;
        } catch (error) {
            console.error('Error getting user WOM entry: ', error);
            await interaction.editReply(
                'Something went wrong. Please try again.'
            );
            return;
        }

        // Check if user is already registered with this WOM ID
        try {
            const memberFromWOMID = await models.Member.findOne({
                womID: womID,
            });

            if (memberFromWOMID) {
                await interaction.editReply(
                    'The given RSN is already registered with another member!'
                );
                return;
            }
        } catch (error) {
            console.error(
                'Error checking if wom ID is already registered: ',
                error
            );
            await interaction.editReply(
                'Something went wrong. Please try again.'
            );
            return;
        }

        const newMember = new models.Member({
            discordID: discordID,
            womID: womID,
            currentCabbages: womResult.ehp + womResult.ehb,
            currentRank: null,
            miscCabbages: 0,
        });
        await newMember.save();
    },
};
