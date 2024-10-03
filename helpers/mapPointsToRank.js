const { rankCutoffs, rankNames } = require('../config.json');

function mapPointsToRank(points) {
    for (let i = rankCutoffs.length - 1; i >= 0; i--) {
        if (points >= rankCutoffs[i]) {
            return rankNames[i];
        }
    }
}

module.exports = mapPointsToRank;
