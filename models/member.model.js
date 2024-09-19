const { getMongooseClient } = require('../config/database.js');

const mongooseClient = getMongooseClient();
const MemberSchema = new mongooseClient.Schema({
    womID: { type: String, required: true },
    discordID: { type: String, required: true },
    currentCabbages: { type: Number, default: 0 },
    currentRank: { type: String, default: null },
    eventCabbages: { type: Number, default: 0 },
    accountProgression: {
        max: { type: Boolean, default: false },
        inferno: { type: Boolean, default: false },
        quiver: { type: Boolean, default: false },
        blorva: { type: Boolean, default: false },
        questPoints: { type: Number, default: 0 },
        clogSlots: { type: Number, default: 0 },
        caTier: { type: String, default: null, uppercase: true }, // For example "GRANDMASTER"
        adTier: { type: String, default: null, uppercase: true }, // For example "MEDIUM"
    },
});

MemberSchema.set('timestamps', true);
const Member = mongooseClient.model('Member', MemberSchema);
module.exports = { Member };
