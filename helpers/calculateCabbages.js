const Configuration = require('../config.json');

function calculateCurrentCabbages(memberData, playerDetails) {
    // We return an object with key-value pairs
    // If playerDetails is undefined (not provided), we reverse engineer the core cabbages
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
            : Math.floor(playerDetails.ehp + playerDetails.ehb);
    return cabbageBreakdown;
}

module.exports = { calculateCurrentCabbages };
