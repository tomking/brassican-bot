import { Environment } from '../services/environment.ts';
import { getWOMClient } from '../config/wom.ts';
import { Member } from '../models/member.ts';
import { updateMemberRank } from './updateMemberRank.ts';
import type { Client } from 'discord.js';

export const delay = (milliseconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export const updateAllMemberRanks = async (discordClient: Client) => {
    // This is a very expensive operation
    // TODO: Investigate ways to reduce the cost of this (potentially avoid updating dead accounts/members)

    const womClient = getWOMClient();
    await womClient.groups.updateAll(
        parseInt(Environment.WOM_GROUP_ID, 10),
        Environment.WOM_GROUP_VERIFICATION_CODE,
    );

    // We pause execution for five minutes to allow plenty of time for WOM to attempt to update all clan members
    // See https://docs.wiseoldman.net/groups-api/group-endpoints for info on why this approach is preferred
    await delay(300000);

    const womMemberIDs = (await Member.find({}, 'discordID -_id').exec()).map(
        (doc) => doc.discordID,
    ) as string[];

    for (const discordID of womMemberIDs) {
        await updateMemberRank(discordID, discordClient);
        await delay(5000);
    }

    console.log(`Attempt to update all member's cabbage counts has finished.`);
};
