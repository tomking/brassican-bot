import process from 'node:process';

import * as z from 'zod';
import 'jsr:@std/dotenv/load';

const ENVIRONMENT_SCHEMA = z.object({
    DISCORD_BOT_TOKEN: z.string(),
    DISCORD_APP_ID: z.string(),
    MONGO_URL: z.string(),
    CABBAGE_DB_NAME: z.string(),
    WOM_GROUP_ID: z.string(),
    WOM_GROUP_VERIFICATION_CODE: z.string(),
    DISCORD_MOD_ROLE_ID: z.string(),
    DISCORD_CA_ROLE_ID: z.string(),
    LOG_CHANNEL_ID: z.string(),
    GUILD_ID: z.string(),
    RANK_UPDATES_CHANNEL: z.string(),
    WOM_API_KEY: z.string().optional(),
    DEVELOPER_DISCORD_CONTACT: z.string().optional(),
    JADE_RANK_ID: z.string(),
    RED_TOPAZ_RANK_ID: z.string(),
    SAPPHIRE_RANK_ID: z.string(),
    EMERALD_RANK_ID: z.string(),
    RUBY_RANK_ID: z.string(),
    DIAMOND_RANK_ID: z.string(),
    DRAGON_STONE_RANK_ID: z.string(),
    ONYX_RANK_ID: z.string(),
    ZENYTE_RANK_ID: z.string(),
});

type Environment = z.infer<typeof ENVIRONMENT_SCHEMA>;

export const initialize = () => {
    try {
        ENVIRONMENT_SCHEMA.parse(process.env);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            throw new Error(JSON.stringify(error.issues, null, 2));
        } else if (error instanceof Error) {
            throw error;
        }
    }
};

export const Environment = process.env as Environment;
