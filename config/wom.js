WOM_API_KEY = process.env.WOM_API_KEY;
DEVELOPER_DISCORD_CONTACT = process.env.DEVELOPER_DISCORD_CONTACT;

const { WOMClient } = require('@wise-old-man/utils');

const womClient = new WOMClient({
    apiKey: WOM_API_KEY,
    userAgent: DEVELOPER_DISCORD_CONTACT,
});

module.exports = { womClient };
