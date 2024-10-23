const { SlashCommandBuilder } = require('discord.js');

const { Environment } = require('../../services/environment');
const models = require('../../models');
const { getWOMClient } = require('../../config/wom.js');
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
            const womClient = getWOMClient();
            womResult = await womClient.players.getPlayerDetails(rsn);
        } catch (error) {
            if (error.name === 'NotFoundError') {
                const womWebsite = `https://wiseoldman.net/players/${rsn}`;
                const reply =
                    "Unable to register with this RSN as it hasn't been tracked yet by Wise Old Man. " +
                    `Please visit [this page](${womWebsite}) to start tracking your account. ` +
                    'After that, run the `\\register` command again.';
                await interaction.editReply(reply);
                return;
            }
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
            womID: womResult.id,
            discordID: discordID,
        });

        await newMember.save();
        await interaction.editReply(
            "You're all set! Keep an eye out for your new rank to be applied soon!"
        );

        updateMemberRank(discordID, interaction.client);

        // Send log message that user was registered
        const logChannel = interaction.client.channels.cache.get(
            Environment.LOG_CHANNEL_ID
        );
        logChannel.send(
            `${interaction.member.toString()} has registered for the rank system using the RSN: \`${rsn}\``
        );

        return;
    },
};
