const { WOMClient } = require('@wise-old-man/utils');

const { Configuration } = require('../configuration');

let womClient;

const initialize = () => {
    womClient = new WOMClient({
        apiKey: Configuration.WOM_API_KEY,
        userAgent: Configuration.DEVELOPER_DISCORD_CONTACT,
    });
};

module.exports = {
    initialize,
    get WOMClient() {
        return womClient;
    },
};
