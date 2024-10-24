import { rankCutoffs, rankNames } from '../config.json';

export const mapPointsToRank = (points: any) => {
    for (let i = rankCutoffs.length - 1; i >= 0; i--) {
        if (points >= rankCutoffs[i]) {
            return rankNames[i];
        }
    }
    return rankNames[0];
};
