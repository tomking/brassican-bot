const { WOMClient } = require('@wise-old-man/utils');

const { Environment } = require('../services/environment');

let womClient;

const initialize = async () => {
    womClient = new WOMClient({
        apiKey: Environment.WOM_API_KEY,
        userAgent: Environment.DEVELOPER_DISCORD_CONTACT,
    });
};

const getWOMClient = () => {
    return womClient;
};

module.exports = {
    initialize,
    getWOMClient,
};
