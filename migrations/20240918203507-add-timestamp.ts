import mongoose from 'mongoose';

export const up = async (db: mongoose.mongo.Db) => {
    await db.collection('members').updateMany(
        {},
        {
            $rename: { registeredDate: 'createdAt' },
            $set: { updatedAt: null },
        }
    );
};

export const down = async (db: mongoose.mongo.Db) => {
    await db.collection('members').updateMany(
        {},
        {
            $rename: { createdAt: 'registeredDate' },
            $unset: { updatedAt: '' },
        }
    );
};
