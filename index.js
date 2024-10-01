const environment = require('./services/environment');
const database = require('./config/database');
const discord = require('./discord');
const wiseoldman = require('./config/wom');
const scheduler = require('./services/scheduler');

(async () => {
    await environment.initialize();
    await database.initialize();
    await wiseoldman.initialize();
    await discord.initialize();
    await scheduler.initialize();

    console.log('TEST!! ;)');
})();
