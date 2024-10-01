const { WOMClient } = require('@wise-old-man/utils');
const { Environment } = require('../services/environment');

let womClient;
let availTokens = 100;
let lastTokenReplenish = Date.now();

const replenishTokens = () => {
    const now = Date.now();
    const elapsedTime = now - lastTokenReplenish;
    const tokensToAdd = Math.floor((elapsedTime / 60000) * 100);
    availTokens = Math.min(availTokens + tokensToAdd, 100);
    lastTokenReplenish = now;
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
    if (canMakeCall()) {
        return apiCall();
    } else {
        const delay = 60000 / 100;
        return new Promise((resolve) =>
            setTimeout(() => resolve(requestWithRateLimit(apiCall)), delay)
        );
    }
};

const initialize = async () => {
    womClient = new WOMClient({
        apiKey: Environment.WOM_API_KEY,
        userAgent: Environment.DEVELOPER_DISCORD_CONTACT,
    });
};

const getWOMClient = () => {
    return new Proxy(womClient, {
        get(target, prop) {
            if (typeof target[prop] === 'function') {
                return (...args) =>
                    requestWithRateLimit(() => target[prop](...args));
            }
            return target[prop];
        },
    });
};

module.exports = {
    initialize,
    getWOMClient,
};
