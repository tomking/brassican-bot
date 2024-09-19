const mongoose = require('mongoose');
const { config, database, down, up } = require('migrate-mongo');

const { Configuration } = require('../services/configuration');

const initialize = async () => {
    try {
        await mongoose.connect(Configuration.MONGO_URL, {
            dbName: Configuration.CABBAGE_DB_NAME,
        });
    } catch (error) {
        console.error('Database connection failed: ', error);
        return;
    }
    config.set({
        mongodb: {
            url: Configuration.MONGO_URL,
            databaseName: Configuration.CABBAGE_DB_NAME,
            options: {
                useNewUrlParser: true, // removes a deprecation warning when connecting
                useUnifiedTopology: true, // removes a deprecating warning when connecting
            },
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
