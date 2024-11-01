import * as fs from 'node:fs';
import * as path from 'node:path';

import { Client, Collection } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { GatewayIntentBits } from 'discord-api-types/v10';
import { Environment } from './services/environment.ts';

export type ModifiedDiscordClient = Client & {
    commands?: Collection<string, {
        name: string;
        once?: boolean;
        data: SlashCommandBuilder;
        execute: (...args: unknown[]) => Promise<void>;
    }>;
};

let client: ModifiedDiscordClient;

export const initialize = async () => {
    client = new Client({ intents: [GatewayIntentBits.Guilds] });

    // Load all commands from dir/subdirs on start
    client.commands = new Collection();
    const foldersPath = path.join(import.meta.dirname!, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs
            .readdirSync(commandsPath)
            .filter((file) => file.endsWith('.ts'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command: {
                name: string;
                once?: boolean;
                data: SlashCommandBuilder;
                execute: (...args: unknown[]) => Promise<void>;
            } = await import(`file://${filePath}`);

            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(
                    `[WARNING] (RUN) The command at ${filePath} is missing a required "data" or "execute" property.`,
                );
            }
        }
    }

    // Load all event handlers from dir on start
    const eventsPath = path.join(import.meta.dirname!, 'events');
    const eventFiles = fs
        .readdirSync(eventsPath)
        .filter((file) => file.endsWith('.ts'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);

        const event: {
            name: string;
            once?: boolean;
            execute: (...args: unknown[]) => Promise<void>;
        } = await import(`file://${filePath}`);

        if (event.once) {
            client.once(
                event.name,
                (...args: unknown[]) => event.execute(...args),
            );
        } else {
            client.on(
                event.name,
                (...args: unknown[]) => event.execute(...args),
            );
        }
    }

    await client.login(Environment.DISCORD_BOT_TOKEN);
};

export const getDiscordClient = () => {
    return client;
};
