const { WOMClient } = require('@wise-old-man/utils');
const { Environment } = require('../services/environment');

const WOM_RATE_LIMIT = Environment.WOM_API_KEY ? 100 : 20;
const TIME_PER_TOKEN = 60000 / WOM_RATE_LIMIT;

let womClient;
let availTokens = WOM_RATE_LIMIT;
let lastTokenReplenish = Date.now();

const replenishTokens = () => {
    const now = Date.now();
    const elapsedTime = now - lastTokenReplenish;
    const tokensToAdd = Math.floor(elapsedTime / TIME_PER_TOKEN);
    console.log('elapsed time', elapsedTime);
    console.log('tokenstoAdd', tokensToAdd);
    availTokens = Math.min(availTokens + tokensToAdd, WOM_RATE_LIMIT);
    lastTokenReplenish = lastTokenReplenish + tokensToAdd * TIME_PER_TOKEN;
};

const canMakeCall = () => {
    replenishTokens();
    if (availTokens > 0) {
        availTokens -= 1;
        return true;
    }
    return false;
};

const requestWithRateLimit = async (apiCall) => {
    while (!canMakeCall()) {
        await new Promise((resolve) => setTimeout(resolve, TIME_PER_TOKEN));
    }

    return apiCall();
};

const initialize = async () => {
    womClient = new WOMClient({
        apiKey: Environment.WOM_API_KEY,
        userAgent: Environment.DEVELOPER_DISCORD_CONTACT,
    });
};

const handler = {
    get(target, key) {
        if (typeof target[key] === 'function') {
            return (...args) =>
                requestWithRateLimit(() => target[key](...args));
        } else if (typeof target[key] === 'object' && target[key] !== null) {
            return new Proxy(target[key], handler);
        } else {
            return target[key];
        }
    },
};

const getWOMClient = () => {
    return new Proxy(womClient, handler);
};

module.exports = {
    initialize,
    getWOMClient,
};
