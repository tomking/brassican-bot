const { SlashCommandBuilder } = require('discord.js');

const { Configuration } = require('../../services/configuration.js');
const models = require('../../models');
const updateMemberRank = require('../../helpers/updateMemberRank.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('approve')
        .setDescription('[STAFF ONLY] Approve a rank submission')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('max-cape')
                .setDescription('[STAFF ONLY] Approve max cape')
                .addUserOption((option) =>
                    option
                        .setName('user')
                        .setDescription(
                            'The member whose submission you are approving'
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('infernal-cape')
                .setDescription('[STAFF ONLY] Approve infernal cape')
                .addUserOption((option) =>
                    option
                        .setName('user')
                        .setDescription(
                            'The member whose submission you are approving'
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('quiver')
                .setDescription("[STAFF ONLY] Approve Dizana's quiver")
                .addUserOption((option) =>
                    option
                        .setName('user')
                        .setDescription(
                            'The member whose submission you are approving'
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('blorva')
                .setDescription(
                    '[STAFF ONLY] Approve ancient blood ornament kit'
                )
                .addUserOption((option) =>
                    option
                        .setName('user')
                        .setDescription(
                            'The member whose submission you are approving'
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('quest-points')
                .setDescription('[STAFF ONLY] Approve quest points')
                .addIntegerOption((option) =>
                    option
                        .setName('qp')
                        .setDescription(
                            'The current number of quest points the user has'
                        )
                        .setRequired(true)
                )
                .addUserOption((option) =>
                    option
                        .setName('user')
                        .setDescription(
                            'The member whose submission you are approving'
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('collection-log')
                .setDescription('[STAFF ONLY] Approve collection log slots')
                .addIntegerOption((option) =>
                    option
                        .setName('slots')
                        .setDescription(
                            'The current number of collection log slots the user has filled'
                        )
                        .setRequired(true)
                )
                .addUserOption((option) =>
                    option
                        .setName('user')
                        .setDescription(
                            'The member whose submission you are approving'
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('achievement-diary')
                .setDescription(
                    '[STAFF ONLY] Approve an achievement diary tier'
                )
                .addStringOption((option) =>
                    option
                        .setName('tier')
                        .setDescription(
                            'The highest tier the user has fully completed'
                        )
                        .setRequired(true)
                        .addChoices(
                            {
                                name: 'Easy',
                                value: 'Easy',
                            },
                            {
                                name: 'Medium',
                                value: 'Medium',
                            },
                            {
                                name: 'Hard',
                                value: 'Hard',
                            },
                            {
                                name: 'Elite',
                                value: 'Elite',
                            }
                        )
                )
                .addUserOption((option) =>
                    option
                        .setName('user')
                        .setDescription(
                            'The member whose submission you are approving'
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('combat-achievements')
                .setDescription(
                    '[STAFF ONLY] Approve a combat achievement tier'
                )
                .addStringOption((option) =>
                    option
                        .setName('tier')
                        .setDescription(
                            'The highest tier the user has fully completed'
                        )
                        .setRequired(true)
                        .addChoices(
                            {
                                name: 'Easy',
                                value: 'Easy',
                            },
                            {
                                name: 'Medium',
                                value: 'Medium',
                            },
                            {
                                name: 'Hard',
                                value: 'Hard',
                            },
                            {
                                name: 'Elite',
                                value: 'Elite',
                            },
                            {
                                name: 'Master',
                                value: 'Master',
                            },
                            {
                                name: 'Grandmaster',
                                value: 'Grandmaster',
                            }
                        )
                )
                .addUserOption((option) =>
                    option
                        .setName('user')
                        .setDescription(
                            'The member whose submission you are approving'
                        )
                        .setRequired(true)
                )
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

        let submissionLogString;

        // Update memberData based on submission
        switch (interaction.options.getSubcommand()) {
            case 'max-cape':
                submissionLogString = 'max cape completion';
                memberData.accountProgression.max = true;
                break;

            case 'infernal-cape':
                submissionLogString = 'inferno completion';
                memberData.accountProgression.inferno = true;
                break;

            case 'quiver':
                submissionLogString = 'quiver completion';
                memberData.accountProgression.quiver = true;
                break;

            case 'blorva':
                submissionLogString = 'blorva completion';
                memberData.accountProgression.blorva = true;
                break;

            case 'quest-points':
                memberData.accountProgression.questPoints =
                    interaction.options.getInteger('qp');
                submissionLogString = `${interaction.options.getInteger(
                    'qp'
                )} quest points`;
                break;

            case 'collection-log':
                memberData.accountProgression.clogSlots =
                    interaction.options.getInteger('slots');
                submissionLogString = `${interaction.options.getInteger(
                    'slots'
                )} collection log slots`;
                break;

            case 'achievement-diary':
                memberData.accountProgression.adTier =
                    interaction.options.getString('tier');
                submissionLogString = `${interaction.options
                    .getString('tier')
                    .toLowerCase()} achievement diaries completion`;
                break;

            case 'combat-achievements':
                memberData.accountProgression.caTier =
                    interaction.options.getString('tier');
                submissionLogString = `${interaction.options
                    .getString('tier')
                    .toLowerCase()} combat achievements completion`;
                break;

            default:
                submissionLogString = 'ERROR';
                break;
        }

        await memberData.save();

        // Complete the interaction
        await interaction.editReply(
            `${interaction.options
                .getUser('user')
                .toString()}'s submission of ${submissionLogString} has been approved successfully!`
        );

        updateMemberRank(discordID, interaction.client);

        // Send log message
        const logChannel = interaction.client.channels.cache.get(
            Configuration.LOG_CHANNEL_ID
        );

        logChannel.send(
            `${interaction.options
                .getUser('user')
                .toString()}'s submission of ${submissionLogString} has been approved by ${interaction.member.toString()}`
        );

        return;
    },
};
