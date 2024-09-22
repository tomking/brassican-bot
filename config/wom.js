const { WOMClient } = require('@wise-old-man/utils');

const { Configuration } = require('../services/configuration');

let womClient;

const initialize = async () => {
    womClient = new WOMClient({
        apiKey: Configuration.WOM_API_KEY,
        userAgent: Configuration.DEVELOPER_DISCORD_CONTACT,
    });
};

const getWOMClient = () => {
    return womClient;
};

module.exports = {
    initialize,
    getWOMClient,
};
