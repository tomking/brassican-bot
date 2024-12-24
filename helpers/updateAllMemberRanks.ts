import { Environment } from '../services/environment';
import { getWOMClient } from '../config/wom';
import { Member } from '../models/member';
import { updateMemberRank } from './updateMemberRank';

export const delay = (milliseconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export const updateAllMemberRanks = async (discordClient: any) => {
    // This is a very expensive operation
    // TODO: Investigate ways to reduce the cost of this (potentially avoid updating dead accounts/members)

    const womClient = getWOMClient();
    await womClient.groups.updateAll(
        Environment.WOM_GROUP_ID,
        Environment.WOM_GROUP_VERIFICATION_CODE
    );

    // We pause execution for five minutes to allow plenty of time for WOM to attempt to update all clan members
    // See https://docs.wiseoldman.net/groups-api/group-endpoints for info on why this approach is preferred
    await delay(300000);

    let womMemberIDs = await Member.find({}, 'discordID -_id').exec();

    womMemberIDs = womMemberIDs.map((doc: any) => doc.discordID);

    await womMemberIDs.forEach(async (discordID: any) => {
        await updateMemberRank(discordID, discordClient);
        await delay(5000);
    });

    console.log(`Attempt to update all member's cabbage counts has finished.`);
};