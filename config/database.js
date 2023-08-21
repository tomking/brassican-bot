MONGO_URL = process.env.MONGO_URL;
CABBAGE_DB_NAME = process.env.CABBAGE_DB_NAME;

const mongoose = require('mongoose');

mongoose
    .connect(MONGO_URL + '/' + CABBAGE_DB_NAME)
    .catch((error) => console.error('Database connection failed: ', error));

module.exports = mongoose;
