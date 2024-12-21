module.exports = {
    async up(db) {
        await db.collection('members').updateMany(
            {},
            {
                $rename: { registeredDate: 'createdAt' },
                $set: { updatedAt: null },
            },
        );
    },

    async down(db) {
        await db.collection('members').updateMany(
            {},
            {
                $rename: { createdAt: 'registeredDate' },
                $unset: { updatedAt: '' },
            },
        );
    },
};
