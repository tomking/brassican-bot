const mongoose = require('mongoose');

const { Configuration } = require('../configuration');

const initialize = () => {
    mongoose
        .connect(Configuration.MONGO_URL, {
            dbName: Configuration.CABBAGE_DB_NAME,
        })
        .catch((error) => console.error('Database connection failed: ', error));
};

module.exports = {
    initialize,
    get Mongoose() {
        return mongoose;
    },
};
