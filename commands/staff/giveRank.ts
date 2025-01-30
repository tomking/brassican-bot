import {
    ChatInputCommandInteraction,
    GuildMember,
    Role,
    SlashCommandBuilder,
} from 'discord.js';
import * as z from 'zod';

import { Environment } from '../../services/environment';
import { Scheduler } from '../../stores';

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

// create a type for the "duration" argument
// this can be something like "1 week", "2 days", "3 hours", etc.
// the minimum granularity should be hours, the maximum should be weeks

// duration should be of a combination of a numer, followed by a space, followed by a time unit

// the time unit should be one of the following:
// - hour
// - day
// - week

// number should be minumum 1, maximum 100

// use zod validation

export type DurationUnit = 'hour' | 'hours' | 'day' | 'days' | 'week' | 'weeks';

export const DurationSchema = z.string().refine((value) => {
    // multiple durations can be separated by a comma
    // every duration unit can only occur once, where hour/hours, day/days, and week/weeks are considered the same

    // const durations = value.split(',').map((d) => d.trim());

    // if (durations.length > 1) {
    //     return durations.every((d) => DurationSchema.check(d));
    // }

    const [number, unit] = value.split(' ');

    if (!['hour', 'hours', 'day', 'days', 'week', 'weeks'].includes(unit)) {
        return false;
    }

    if (parseInt(number) < 1 || parseInt(number) > 100) {
        return false;
    }

    return true;
});

export type Duration = z.infer<typeof DurationSchema>;

export const parseDuration = (
    duration: Duration
): { number: number; unit: DurationUnit } => {
    const [number, unit] = duration.split(' ');

    return {
        number: parseInt(number),
        unit: unit as DurationUnit,
    };
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply({ ephemeral: true });

    // Check if calling user is a member of staff (mod or CA)
    if (
        !(interaction.member as GuildMember).roles.cache.some(
            (role: Role) =>
                role.id === Environment.DISCORD_MOD_ROLE_ID ||
                role.id === Environment.DISCORD_CA_ROLE_ID
        )
    ) {
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
        endDate.setMinutes(0);
        endDate.setSeconds(0);
        endDate.setMilliseconds(0);

        console.log('Calculated end date:', endDate.toISOString());
    }

    console.log(interaction.options);

    // TODO: implement
    if (interaction.options.getString('end-date')) {
        console.log('gfiugfif');
        const scheduledAction = new Scheduler({
            command: 'giveRank',
            arguments: {
                user: interaction.options.getUser('user')?.id,
                rank: interaction.options.getString('rank'),
            },
            date: interaction.options.getString('end-date'),
        });

        console.log(scheduledAction);

        await scheduledAction.save();
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
