WOM_GROUP_ID = process.env.WOM_GROUP_ID;
WOM_GROUP_VERIFICATION_CODE = process.env.WOM_GROUP_VERIFICATION_CODE;

const womClient = require('../config/wom.js');
const models = require('../models');
const updateMemberRank = require('./updateMemberRank.js');

function delay(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function updateAllMemberRanks(discordClient) {
    // This is a very expensive operation
    // TODO: Investigate ways to reduce the cost of this (potentially avoid updating dead accounts/members)

    await womClient.groups.updateAll(WOM_GROUP_ID, WOM_GROUP_VERIFICATION_CODE);

    // We pause execution for five minutes to allow plenty of time for WOM to attempt to update all clan members
    // See https://docs.wiseoldman.net/groups-api/group-endpoints for info on why this approach is preferred
    //await delay(300000);

    womMemberIDs = await models.Member.find({}, 'discordID -_id').exec();

    womMemberIDs = womMemberIDs.map((doc) => doc.discordID);

    await womMemberIDs.forEach(async (discordID) => {
        await updateMemberRank(discordID, discordClient);
    });

    console.log(`Attempt to update all member's cabbage counts has finished.`);
}

module.exports = updateAllMemberRanks;
