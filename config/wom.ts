import { WOMClient } from '@wise-old-man/utils';

import { Environment } from '../services/environment.ts';

const WOM_RATE_LIMIT = Environment.WOM_API_KEY ? 100 : 20;
const TIME_PER_TOKEN_MS = 60000 / WOM_RATE_LIMIT;

let womClient: WOMClient;
let availTokens = WOM_RATE_LIMIT;
let lastTokenReplenish = Date.now();

export type GenericWOMFunction = <T>(...args: unknown[]) => T;

const replenishTokens = () => {
    const now = Date.now();
    const elapsedTime = now - lastTokenReplenish;
    const tokensToAdd = Math.floor(elapsedTime / TIME_PER_TOKEN_MS);
    availTokens = Math.min(availTokens + tokensToAdd, WOM_RATE_LIMIT);
    lastTokenReplenish = lastTokenReplenish + tokensToAdd * TIME_PER_TOKEN_MS;
};

const canMakeCall = () => {
    replenishTokens();
    if (availTokens > 0) {
        availTokens -= 1;
        return true;
    }
    return false;
};

const requestWithRateLimit = async (apiCall: GenericWOMFunction) => {
    while (!canMakeCall()) {
        await new Promise((resolve) => setTimeout(resolve, TIME_PER_TOKEN_MS));
    }

    return apiCall();
};

export const initialize = () => {
    womClient = new WOMClient({
        apiKey: Environment?.WOM_API_KEY,
        userAgent: Environment?.DEVELOPER_DISCORD_CONTACT,
    });
};

const handler: ProxyHandler<WOMClient> = {
    get(target, key: keyof WOMClient) {
        if (typeof target[key] === 'function') {
            return (...args: unknown[]) =>
                requestWithRateLimit(() =>
                    (target[key] as GenericWOMFunction)(...args)
                );
        }

        if (
            typeof target[key] === 'object' &&
            target[key] !== null
        ) {
            return new Proxy(target[key], handler as ProxyHandler<object>);
        }

        return target[key];
    },
};

export const getWOMClient = () => {
    return new Proxy(womClient, handler);
};
