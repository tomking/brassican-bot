const configuration = require('./services/configuration');
const database = require('./config/database');
const discord = require('./discord');
const wiseoldman = require('./config/wom');
const scheduler = require('./services/scheduler');

(async () => {
    await configuration.initialize();
    await database.initialize();
    await wiseoldman.initialize();
    await discord.initialize();
    await scheduler.initialize();
})();
