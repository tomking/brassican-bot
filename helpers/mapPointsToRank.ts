import * as Configuration from '../config.json';

export const mapPointsToRank = (points: number) => {
    for (let i = Configuration.rankCutoffs.length - 1; i >= 0; i--) {
        if (points >= Configuration.rankCutoffs[i]) {
            return Configuration.rankNames[i];
        }
    }

    return Configuration.rankNames[0];
};
