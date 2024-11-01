import {
    ChatInputCommandInteraction,
    GuildMember,
    Role,
    TextChannel,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

import { updateAllMemberRanks } from '../../helpers/updateAllMemberRanks.ts';
import { Environment } from '../../services/environment.ts';

export const data = new SlashCommandBuilder()
    .setName('updateall')
    .setDescription(
        '[STAFF ONLY] [WARNING: THIS IS DEMANDING] Attempt to update all user cabbage counts!',
    );

export const execute = async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply({ ephemeral: true });

    // Check if calling user is a member of staff (mod or CA)
    if (
        !(interaction.member as GuildMember).roles.cache.some(
            (role: Role) =>
                role.id === Environment.DISCORD_MOD_ROLE_ID ||
                role.id === Environment.DISCORD_CA_ROLE_ID,
        )
    ) {
        await interaction.editReply(
            'Only members of staff can use this command!',
        );
        return;
    }

    await interaction.editReply(
        `Request received, attempting to update all member's cabbage counts.`,
    );

    try {
        updateAllMemberRanks(interaction.client);
    } catch (error) {
        const logChannel = interaction.client.channels.cache.get(
            Environment.LOG_CHANNEL_ID,
        ) as TextChannel;

        logChannel.send(
            `${interaction.member?.toString()}'s attempt to update all member's cabbage counts encountered an error.`,
        );

        console.log(error);
        return;
    }

    return;
};
