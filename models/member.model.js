const mongoose = require('../config/database.js');

const Member = mongoose.model(
    'Member',
    new mongoose.Schema({
        womID: String,
        discordID: String,
        currentCabbages: Number,
        currentRank: String,
        itemizedCabbages: {
            extra: Number,
            clog: Number,
            ca: Number,
            ad: Number,
        },
        registeredDate: Date,
    })
);

module.exports = { Member };
