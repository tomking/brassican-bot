const mongoose = require('mongoose');
const { config, database, up } = require('migrate-mongo');

const { Environment } = require('../services/environment');

const initialize = async () => {
    try {
        await mongoose.connect(Environment.MONGO_URL, {
            dbName: Environment.CABBAGE_DB_NAME,
        });
    } catch (error) {
        console.error('Database connection failed: ', error);
        return;
    }
    config.set({
        mongodb: {
            url: Environment.MONGO_URL,
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

const getMongooseClient = () => {
    return mongoose;
};

module.exports = {
    initialize,
    getMongooseClient,
};
