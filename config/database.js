const mongoose = require('mongoose');

const { Configuration } = require('../services/configuration');

const initialize = async () => {
    mongoose
        .connect(Configuration.MONGO_URL, {
            dbName: Configuration.CABBAGE_DB_NAME,
        })
        .catch((error) => console.error('Database connection failed: ', error));
};

const getMongooseClient = () => {
    return mongoose;
};

module.exports = {
    initialize,
    getMongooseClient,
};
