import * as environment from './services/environment';
import * as database from './config/database';
import * as discord from './discord';
import * as wiseoldman from './config/wom';
import * as scheduler from './services/scheduler';

(async () => {
    environment.initialize();
    await database.initialize();
    wiseoldman.initialize();
    await discord.initialize();
    scheduler.initialize();
})();
