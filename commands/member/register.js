LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
RANK_UPDATES_CHANNEL = process.env.RANK_UPDATES_CHANNEL;

const { SlashCommandBuilder } = require('discord.js');
const models = require('../../models');
const womClient = require('../../config/wom.js');
const updateMemberRank = require('../../helpers/updateMemberRank.js');

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
        let womResult;
        try {
            womResult = await womClient.players.getPlayerDetails(rsn);
            if (!womResult) {
                await interaction.editReply('The given RSN is invalid!');
                return;
            }
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
                womID: womResult.id,
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
            womID: womResult.id,
            currentCabbages: womResult.ehp + womResult.ehb,
            currentRank: null,
            miscCabbages: 0,
            registeredDate: new Date(),
        });
        await newMember.save();
        await interaction.editReply(
            "You're all set! Keep an eye out for your new rank to be applied soon!"
        );

        updateMemberRank(discordID);

        // Send log message that user was registered
        const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
        logChannel.send(
            `@${interaction.user.id} has registered for the rank system using the RSN: ${rsn}`
        );

        return;
    },
};
