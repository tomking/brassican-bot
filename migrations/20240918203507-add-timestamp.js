module.exports = {
    async up(db, client) {
        await db.collection('members').updateMany(
            {},
            {
                $rename: { registeredDate: 'createdAt' },
                $set: { updatedAt: null },
            }
        );
    },

    async down(db, client) {
        await db.collection('members').updateMany(
            {},
            {
                $rename: { createdAt: 'registeredDate' },
                $unset: { updatedAt: '' },
            }
        );
    },
};
