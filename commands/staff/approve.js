const { SlashCommandBuilder } = require('discord.js');

const { Configuration } = require('../../configuration.js');
const models = require('../../models');
const updateMemberRank = require('../../helpers/updateMemberRank.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('approve')
        .setDescription('[STAFF ONLY] Approve a rank submission')
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

        // Set the corresponding itemized cabbages based on submission
        switch (interaction.options.getSubcommand()) {
            case 'achievement-diary':
                switch (interaction.options.getString('tier')) {
                    case 'Easy':
                        memberData.itemizedCabbages.ad = 5;
                        break;

                    case 'Medium':
                        memberData.itemizedCabbages.ad = 10;
                        break;

                    case 'Hard':
                        memberData.itemizedCabbages.ad = 20;
                        break;

                    case 'Elite':
                        memberData.itemizedCabbages.ad = 40;
                        break;

                    default:
                        memberData.itemizedCabbages.ad = 0;
                        break;
                }

                submissionLogString = `${interaction.options
                    .getString('tier')
                    .toLowerCase()} achievement diaries completion`;

                break;

            case 'combat-achievements':
                switch (interaction.options.getString('tier')) {
                    case 'Easy':
                        memberData.itemizedCabbages.ca = 5;
                        break;

                    case 'Medium':
                        memberData.itemizedCabbages.ca = 10;
                        break;

                    case 'Hard':
                        memberData.itemizedCabbages.ca = 20;
                        break;

                    case 'Elite':
                        memberData.itemizedCabbages.ca = 40;
                        break;

                    case 'Master':
                        memberData.itemizedCabbages.ca = 80;
                        break;

                    case 'Grandmaster':
                        memberData.itemizedCabbages.ca = 160;
                        break;

                    default:
                        memberData.itemizedCabbages.ca = 0;
                        break;
                }

                submissionLogString = `${interaction.options
                    .getString('tier')
                    .toLowerCase()} combat achievements completion`;

                break;

            case 'collection-log':
                memberData.itemizedCabbages.clog =
                    Math.floor(interaction.options.getInteger('slots') / 100) *
                    20;

                submissionLogString = `${interaction.options.getInteger(
                    'slots'
                )} collection log slots`;

                break;

            case 'infernal-cape':
                submissionLogString = 'inferno completion';
                memberData.itemizedCabbages.inferno = 50;
                break;

            case 'max-cape':
                submissionLogString = 'max cape completion';
                memberData.itemizedCabbages.max = 50;
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
