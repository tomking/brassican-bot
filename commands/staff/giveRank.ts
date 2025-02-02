import {
    ChatInputCommandInteraction,
    GuildMember,
    Role,
    SlashCommandBuilder,
} from 'discord.js';

import { Environment } from '../../services/environment';
import { scheduleAction } from '../../services/scheduler';
import { DurationSchema, parseDuration } from '../../utils/duration';
import { isStaff } from '../../services/isStaff';

export const data = new SlashCommandBuilder()
    .setName('giverank')
    .setDescription('[STAFF ONLY] Give a user a (temporary) rank!')
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription('The member to give the rank to')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('rank')
            .setDescription('The rank that has to be applied')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('duration')
            .setDescription('How long the rank should be applied')
            .setRequired(false)
    );

export const execute = async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply({ flags: 'Ephemeral' });

    // Check if calling user is a member of staff (mod or CA)
    if (!isStaff(interaction.member as GuildMember)) {
        await interaction.editReply(
            'Only members of staff can use this command!'
        );
        return;
    }

    const user = interaction.options.getUser('user');
    const rank = interaction.options.getString('rank');
    const duration = interaction.options.getString('duration');

    // check if duration is a valid duration
    let endDate: Date | undefined;
    if (duration) {
        try {
            DurationSchema.parse(duration);
        } catch {
            await interaction.editReply(
                'Please provide a valid duration in the format "1 hour", "2 days", "3 weeks", etc.'
            );

            return;
        }

        const { number, unit } = parseDuration(duration);
        console.log({ number, unit });

        // calculate an end date using these two values
        // e.g. if the current date is 2021-10-10 12:00:00 and the duration is "1 hour"
        // the end date should be 2021-10-10 13:00:00
        // if the duration is "1 day", the end date should be 2021-10-11 12:00:00
        // if the duration is "1 week", the end date should be 2021-10-17 12:00:00
        const now = new Date();
        console.log(now.toISOString());

        endDate = new Date(now);

        switch (unit) {
            case 'second':
            case 'seconds':
                endDate.setSeconds(now.getSeconds() + number);
                break;
            case 'hour':
            case 'hours':
                endDate.setHours(now.getHours() + number);
                break;
            case 'day':
            case 'days':
                endDate.setDate(now.getDate() + number);
                break;
            case 'week':
            case 'weeks':
                endDate.setDate(now.getDate() + number * 7);
                break;
        }

        // round to the nearest hour
        // endDate.setMinutes(0);
        // endDate.setSeconds(0);
        // endDate.setMilliseconds(0);

        console.log('Calculated end date:', endDate.toISOString());
    }

    console.log(interaction.options);

    // TODO: implement
    if (endDate) {
        console.log('Scheduling action');
        await scheduleAction(
            'giveRank',
            {
                user: interaction.options.getUser('user')?.id,
                rank: interaction.options.getString('rank'),
            } as unknown as JSON,
            endDate
        );

        // const scheduledAction = new Scheduler({
        //     command: 'giveRank',
        //     arguments: {
        //         user: interaction.options.getUser('user')?.id,
        //         rank: interaction.options.getString('rank'),
        //     },
        //     date: endDate,
        // });

        // console.log(scheduledAction);

        // await scheduledAction.save();
    }

    // write out the month entirely and the time in 24h format
    await interaction.editReply(
        `${interaction.options
            .getUser('user')!
            .toString()} has temporarily received the ${interaction.options.getString('rank')} rank ${
            endDate
                ? `until ${endDate.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                  })}`
                : ''
        }! `
    );

    return;
};
