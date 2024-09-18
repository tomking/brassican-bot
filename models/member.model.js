const { getMongooseClient } = require('../config/database.js');

const mongooseClient = getMongooseClient();
const Member = mongooseClient.model(
    'Member',
    new mongooseClient.Schema({
        womID: String,
        discordID: String,
        currentCabbages: Number,
        currentRank: String,
        itemizedCabbages: {
            extra: Number,
            clog: Number,
            ca: Number,
            ad: Number,
            max: Number,
            inferno: Number,
        },
        registeredDate: Date,
    })
);

module.exports = { Member };
