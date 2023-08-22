function mapPointsToRank(points) {
    const rankCutoffs = [0, 50, 100, 250, 500, 1000, 1500, 2500, 5000, 6500];
    const rankNames = [
        'Jade',
        'Red Topaz',
        'Sapphire',
        'Emerald',
        'Ruby',
        'Diamond',
        'Dragon Stone',
        'Onyx',
        'Zenyte',
    ];

    for (let i = rankCutoffs.length - 1; i >= 0; i--) {
        if (points >= rankCutoffs[i]) {
            return rankNames[i];
        }
    }
}

module.exports = mapPointsToRank;
