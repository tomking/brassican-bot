import mongoose from 'mongoose';
import { config, database, up } from 'migrate-mongo';

import { Environment } from '../services/environment.ts';

export const initialize = async () => {
    try {
        await mongoose.connect(Environment.MONGO_URL!, {
            dbName: Environment.CABBAGE_DB_NAME,
        });
    } catch (error) {
        console.error('Database connection failed: ', error);
        return;
    }

    config.set({
        mongodb: {
            url: Environment.MONGO_URL!,
            databaseName: Environment.CABBAGE_DB_NAME,
            options: {},
        },
        migrationsDir: 'migrations',
        changelogCollectionName: 'changelog',
        migrationFileExtension: '.js',
    });

    const { db, client } = await database.connect();
    await up(db, client);
};

export const getMongooseClient = () => {
    return mongoose;
};
