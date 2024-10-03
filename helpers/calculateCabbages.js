const Configuration = require('../config.json');

function getCabbageBreakdown(memberData, playerDetails) {
    // We return an object with key-value pairs (<achievement-name>, <amount of cabbages>)
    // If playerDetails is undefined or not provided, we reverse engineer the core cabbages
    const { accountProgression: account } = memberData;
    let cabbageBreakdown = {
        // TODO: change the amount of Clogs, CA and AD
        eventCabbages: memberData.eventCabbages,
        max: account.max ? Configuration.maxCabbages : 0,
        inferno: account.inferno ? Configuration.infernoCabbages : 0,
        quiver: account.quiver ? Configuration.quiverCabbages : 0,
        blorva: account.blorva ? Configuration.blorvaCabbages : 0,
        questCape: account.questCape ? Configuration.questCapeCabbages : 0,
        clogSlots: Math.floor(account.clogSlots / 100) * 20,
        caTier: Configuration.caTierCabbages[account.caTier] || 0,
        adTier: Configuration.adTierCabbages[account.adTier] || 0,
    };
    const sum = Object.values(cabbageBreakdown).reduce(
        (acc, val) => acc + val,
        0
    );
    cabbageBreakdown.core =
        playerDetails === undefined
            ? memberData.currentCabbages - sum
            : playerDetails.ehp + playerDetails.ehb;
    cabbageBreakdown.core = Math.floor(cabbageBreakdown.core);
    return cabbageBreakdown;
}

const cabbagesUntilNext = (currentAmount) => {
    for (i of Configuration.rankCutoffs) {
        if (i > currentAmount) return i - currentAmount;
    }
    return 'N/A'; // More cabbages than highest rank
};

module.exports = { getCabbageBreakdown, cabbagesUntilNext };
