import * as environment from './services/environment.ts';
import * as database from './config/database.ts';
import * as discord from './discord.ts';
import * as wiseoldman from './config/wom.ts';
import * as scheduler from './services/scheduler.ts';

environment.initialize();
await database.initialize();
wiseoldman.initialize();
await discord.initialize();
scheduler.initialize();
