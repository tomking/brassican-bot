import mongoose from 'mongoose';

export const up = async (db: mongoose.mongo.Db) => {
    // Rename itemizedCabbages
    await db.collection('members').updateMany(
        {}, // match all
        {
            $rename: { itemizedCabbages: 'accountProgression' },
        }
    );
    // Rename existing and add new fields
    await db.collection('members').updateMany(
        {}, // match all
        {
            $set: {
                'accountProgression.quiver': false,
                'accountProgression.blorva': false,
                'accountProgression.questCape': false,
            },
            $rename: {
                'accountProgression.extra': 'eventCabbages',
                'accountProgression.clog': 'accountProgression.clogSlots',
                'accountProgression.ad': 'accountProgression.adTier',
                'accountProgression.ca': 'accountProgression.caTier',
            },
        }
    );
    // Convert value of fields: e.g. max=50 -> max=true
    await db.collection('members').updateMany(
        {}, // match all
        [
            {
                $set: {
                    // max cape
                    'accountProgression.max': {
                        $cond: [
                            { $eq: ['$accountProgression.max', 50] },
                            true,
                            false,
                        ],
                    },
                    // infernal cape
                    'accountProgression.inferno': {
                        $cond: [
                            { $eq: ['$accountProgression.inferno', 50] },
                            true,
                            false,
                        ],
                    },
                    // 20 cabbages = 100 clog slots
                    'accountProgression.clogSlots': {
                        $multiply: [5, '$accountProgression.clogSlots'],
                    },
                    // combat achievements
                    'accountProgression.caTier': {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: ['$accountProgression.caTier', 5],
                                    },
                                    then: 'EASY',
                                },
                                {
                                    case: {
                                        $eq: ['$accountProgression.caTier', 10],
                                    },
                                    then: 'MEDIUM',
                                },
                                {
                                    case: {
                                        $eq: ['$accountProgression.caTier', 20],
                                    },
                                    then: 'HARD',
                                },
                                {
                                    case: {
                                        $eq: ['$accountProgression.caTier', 40],
                                    },
                                    then: 'ELITE',
                                },
                                {
                                    case: {
                                        $eq: ['$accountProgression.caTier', 80],
                                    },
                                    then: 'MASTER',
                                },
                                {
                                    case: {
                                        $eq: [
                                            '$accountProgression.caTier',
                                            160,
                                        ],
                                    },
                                    then: 'GRANDMASTER',
                                },
                            ],
                            default: null,
                        },
                    },
                    'accountProgression.adTier': {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: ['$accountProgression.adTier', 5],
                                    },
                                    then: 'EASY',
                                },
                                {
                                    case: {
                                        $eq: ['$accountProgression.adTier', 10],
                                    },
                                    then: 'MEDIUM',
                                },
                                {
                                    case: {
                                        $eq: ['$accountProgression.adTier', 20],
                                    },
                                    then: 'HARD',
                                },
                                {
                                    case: {
                                        $eq: ['$accountProgression.adTier', 40],
                                    },
                                    then: 'ELITE',
                                },
                            ],
                            default: null,
                        },
                    },
                },
            },
        ]
    );
};

export const down = async (db: mongoose.mongo.Db) => {
    // Revert value of fields: e.g. max=true -> max=50
    await db.collection('members').updateMany(
        {}, // match all
        [
            {
                $set: {
                    // max cape
                    'accountProgression.max': {
                        $cond: [
                            { $eq: ['$accountProgression.max', true] },
                            50,
                            0,
                        ],
                    },
                    // infernal cape
                    'accountProgression.inferno': {
                        $cond: [
                            { $eq: ['$accountProgression.inferno', true] },
                            50,
                            0,
                        ],
                    },
                    // 20 cabbages = 100 clog slots
                    'accountProgression.clogSlots': {
                        $multiply: [1 / 5, '$accountProgression.clogSlots'],
                    },
                    // combat achievements
                    'accountProgression.caTier': {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            '$accountProgression.caTier',
                                            'EASY',
                                        ],
                                    },
                                    then: 5,
                                },
                                {
                                    case: {
                                        $eq: [
                                            '$accountProgression.caTier',
                                            'MEDIUM',
                                        ],
                                    },
                                    then: 10,
                                },
                                {
                                    case: {
                                        $eq: [
                                            '$accountProgression.caTier',
                                            'HARD',
                                        ],
                                    },
                                    then: 20,
                                },
                                {
                                    case: {
                                        $eq: [
                                            '$accountProgression.caTier',
                                            'ELITE',
                                        ],
                                    },
                                    then: 40,
                                },
                                {
                                    case: {
                                        $eq: [
                                            '$accountProgression.caTier',
                                            'MASTER',
                                        ],
                                    },
                                    then: 80,
                                },
                                {
                                    case: {
                                        $eq: [
                                            '$accountProgression.caTier',
                                            'GRANDMASTER',
                                        ],
                                    },
                                    then: 160,
                                },
                            ],
                            default: 0,
                        },
                    },
                    'accountProgression.adTier': {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            '$accountProgression.adTier',
                                            'EASY',
                                        ],
                                    },
                                    then: 5,
                                },
                                {
                                    case: {
                                        $eq: [
                                            '$accountProgression.adTier',
                                            'MEDIUM',
                                        ],
                                    },
                                    then: 10,
                                },
                                {
                                    case: {
                                        $eq: [
                                            '$accountProgression.adTier',
                                            'HARD',
                                        ],
                                    },
                                    then: 20,
                                },
                                {
                                    case: {
                                        $eq: [
                                            '$accountProgression.adTier',
                                            'ELITE',
                                        ],
                                    },
                                    then: 40,
                                },
                            ],
                            default: 0,
                        },
                    },
                },
            },
        ]
    );
    // Rename existing and add new fields
    await db.collection('members').updateMany(
        {}, // match all
        {
            $unset: {
                'accountProgression.quiver': '',
                'accountProgression.blorva': '',
                'accountProgression.questCape': '',
            },
            $rename: {
                eventCabbages: 'accountProgression.extra',
                'accountProgression.clogSlots': 'accountProgression.clog',
                'accountProgression.adTier': 'accountProgression.ad',
                'accountProgression.caTier': 'accountProgression.ca',
            },
        }
    );
    // Rename itemizedCabbages
    await db.collection('members').updateMany(
        {}, // match all
        {
            $rename: { accountProgression: 'itemizedCabbages' },
        }
    );
};
