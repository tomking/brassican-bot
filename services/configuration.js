const joi = require('joi');
const dotenv = require('dotenv');

const CONFIGURATION_SCHEMA = joi
    .object({
        DISCORD_BOT_TOKEN: joi.string().required(),
        DISCORD_APP_ID: joi.string().required(),
        MONGO_URL: joi.string().required(),
        CABBAGE_DB_NAME: joi.string().required(),
        WOM_GROUP_ID: joi.string().required(),
        WOM_GROUP_VERIFICATION_CODE: joi.string().required(),
        DISCORD_MOD_ROLE_ID: joi.string().required(),
        DISCORD_CA_ROLE_ID: joi.string().required(),
        LOG_CHANNEL_ID: joi.string().required(),
        GUILD_ID: joi.string().required(),
        RANK_UPDATES_CHANNEL: joi.string().required(),
        JADE_RANK_ID: joi.string().required(),
        RED_TOPAZ_RANK_ID: joi.string().required(),
        SAPPHIRE_RANK_ID: joi.string().required(),
        EMERALD_RANK_ID: joi.string().required(),
        RUBY_RANK_ID: joi.string().required(),
        DIAMOND_RANK_ID: joi.string().required(),
        DRAGON_STONE_RANK_ID: joi.string().required(),
        ONYX_RANK_ID: joi.string().required(),
        ZENYTE_RANK_ID: joi.string().required(),
    })
    .strict()
    .required()
    .unknown();

const initialize = async () => {
    dotenv.config();
    const { error } = CONFIGURATION_SCHEMA.validate(process.env);

    if (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    initialize,
    get Configuration() {
        return process.env;
    },
};
