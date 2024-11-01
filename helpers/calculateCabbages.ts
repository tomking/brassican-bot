import { PlayerDetails } from '@wise-old-man/utils';
import Configuration from '../config.json' with { type: 'json' };
import { IMember } from '../models/member.ts';

export const getCabbageBreakdown = (
    memberData: IMember,
    playerDetails?: PlayerDetails,
) => {
    // We return an object with key-value pairs (<achievement-name>, <amount of cabbages>)
    // If playerDetails is undefined or not provided, we reverse engineer the core cabbages
    const { accountProgression: account } = memberData;
    const cabbageBreakdown = {
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
    } as { [key: string]: number };

    const sum = Object.values(cabbageBreakdown).reduce(
        (acc, val) => acc + val,
        0,
    );

    cabbageBreakdown.core = playerDetails === undefined
        ? memberData.currentCabbages - sum
        : playerDetails.ehp + playerDetails.ehb;
    cabbageBreakdown.core = Math.floor(cabbageBreakdown.core);
    return cabbageBreakdown;
};

export const cabbagesUntilNext = (currentAmount: number) => {
    for (const threshold of Configuration.rankCutoffs) {
        if (threshold > currentAmount) return threshold - currentAmount;
    }
    return -1; // More cabbages than highest rank
};
