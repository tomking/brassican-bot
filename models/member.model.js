const mongoose = require('./config/database.js');

const Member = mongoose.model(
    'Member',
    new mongoose.Schema({
        womID: String,
        discordID: String,
        currentCabbages: Number,
        currentRank: String,
        miscCabbages: Number,
    })
);

module.exports = { Member };
