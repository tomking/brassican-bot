const configuration = require('./configuration');
const database = require('./config/database');
const discord = require('./discord');
const wiseoldman = require('./config/wom');
const scheduler = require('./scheduler');

configuration.initialize();
database.initialize();
discord.initialize();
wiseoldman.initialize();
scheduler.initialize();
