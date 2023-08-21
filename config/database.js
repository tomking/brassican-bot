MONGO_URL = process.env.MONGO_URL;

const mongoose = require('mongoose');

mongoose
    .connect(MONGO_URL)
    .catch((error) => console.error('Database connection failed: ', error));

module.exports = { mongoose };
