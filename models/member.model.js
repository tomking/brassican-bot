const { Mongoose } = require('../config/database.js');

const Member = Mongoose.model(
    'Member',
    new Mongoose.Schema({
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
