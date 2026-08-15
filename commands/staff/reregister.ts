import {
    ChatInputCommandInteraction,
    GuildMember,
    SlashCommandBuilder,
    TextChannel,
} from 'discord.js';

import { getWOMClient } from '../../config/wom';
import { updateMemberRank } from '../../helpers/updateMemberRank';
import { Member } from '../../models/member';
import { Environment } from '../../services/environment';
import { isStaff } from '../../helpers/isStaff';

export const data = new SlashCommandBuilder()
    .setName('reregister')
    .setDescription(
        '[STAFF ONLY] Reconnect a registered member to another WOM username'
    )
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription('The registered Discord member to reconnect')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('rsn')
            .setDescription('The RSN to connect this member to on WOM')
            .setRequired(true)
    );

export const execute = async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply({ flags: 'Ephemeral' });

    if (!isStaff(interaction.member as GuildMember)) {
        await interaction.editReply(
            'Only members of staff can use this command!'
        );
        return;
    }

    const discordUser = interaction.options.getUser('user');
    const rsn = interaction.options.getString('rsn');

    if (!discordUser || !rsn) {
        await interaction.editReply('Invalid command input.');
        return;
    }

    let memberData;
    try {
        memberData = await Member.findOne({
            discordID: discordUser.id,
        });

        if (!memberData) {
            await interaction.editReply('User is not registered!');
            return;
        }
    } catch (error) {
        console.error('Error loading member data for reregister: ', error);
        await interaction.editReply('Something went wrong. Please try again.');
        return;
    }

    let womResult;
    try {
        const womClient = getWOMClient();
        womResult = await womClient.players.getPlayerDetails(rsn);
    } catch (error) {
        if (error instanceof Error && error.name === 'NotFoundError') {
            await interaction.editReply(
                `Unable to find a WOM profile for RSN: \`${rsn}\`.`
            );
            return;
        }

        console.error('Error getting WOM details for reregister: ', error);
        await interaction.editReply('Something went wrong. Please try again.');
        return;
    }

    try {
        const duplicateMember = await Member.findOne({
            womID: womResult.id.toString(),
        });

        if (duplicateMember && duplicateMember.discordID !== discordUser.id) {
            await interaction.editReply(
                'The given RSN is already registered with another member!'
            );
            return;
        }

        memberData.womID = womResult.id.toString();
        await memberData.save();
    } catch (error) {
        console.error('Error updating WOM ID for reregister: ', error);
        await interaction.editReply('Something went wrong. Please try again.');
        return;
    }

    await updateMemberRank(discordUser.id, interaction.client);

    await interaction.editReply(
        `${discordUser.toString()} is now connected to WiseOldMan RSN \`${womResult.displayName || womResult.username || rsn}\`.`
    );

    const logChannel = interaction.client.channels.cache.get(
        Environment.LOG_CHANNEL_ID
    ) as TextChannel;

    if (logChannel) {
        logChannel.send(
            `${interaction.member?.toString()} re-registered ${discordUser.toString()} to WOM RSN: \`${womResult.displayName || womResult.username || rsn}\``
        );
    }
};
