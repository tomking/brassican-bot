import * as environment from './services/environment';
import * as database from './config/database';
import * as discord from './discord';
import * as wiseoldman from './config/wom';
import * as scheduler from './services/scheduler';

(async () => {
    await environment.initialize();
    await database.initialize();
    await wiseoldman.initialize();
    await discord.initialize();
    await scheduler.initialize();
})();
