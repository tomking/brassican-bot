import { TextChannel } from 'discord.js';
import { getDiscordClient } from '../discord';
import * as fs from 'node:fs';
import * as nodePath from 'node:path';
import DocsData from './docs.json';

const __dirname = nodePath.resolve();
const MINIMUM_MESSAGE_LENGTH = 1200;
const MAXIMUM_MESSAGE_LENGTH = 2000;

const getLastUpdateDiscord = async (channelID: string): Promise<Date> => {
    const client = getDiscordClient();
    const channel = (await client.channels.fetch(channelID)) as TextChannel;
    const lastMessage = (await channel.messages.fetch({ limit: 1 })).first();
    // If channel is empty, we return a very early date such that we resend the messages in the channel
    if (lastMessage === undefined) {
        return new Date(0);
    }
    return new Date(lastMessage.createdTimestamp);
};

const getLastUpdateDocs = (channelName: string): Date => {
    try {
        const stats = fs.statSync(`${__dirname}/docs/${channelName}.md`);

        if (!stats) {
            console.error(`File stats are empty for: ${__dirname}/docs/${channelName}.md`);
            return new Date();
        }

        return stats.mtime;
    } catch (error) {
        // If error, we return current date such that
        console.error('Error getting file stats:', error);
        return new Date();
    }
};

const isHeader = (text: string): boolean => /^\*\*/.test(text) || /^#+\s+\w/.test(text);

const parseFileContents = (path: string): string[] => {
    // Read the file
    let content = fs.readFileSync(path, 'utf8');
    // Normalize the content by removing extra newlines
    content = content.replace(/\n+/g, '\n');
    const lines = content.split('\n');

    const messages: string[] = [];
    let currentMessage = '';

    // Iterate through the lines
    for (const index in lines) {
        const line = lines[index];

        // If currentMessage is getting long and line is a header, finish currentMessage and start a new one
        if (currentMessage.length > MINIMUM_MESSAGE_LENGTH && isHeader(line)) {
            messages.push(currentMessage);
            currentMessage = line;
            continue;
        }

        // Merge currentMessage with line if their lengths allow it
        if (currentMessage.length + line.length < MAXIMUM_MESSAGE_LENGTH) {
            currentMessage = currentMessage.concat(line);
            continue;
        }

        // Finish currentMessage and start a new one if above things don't happen
        messages.push(currentMessage);
        currentMessage = line;
    }

    // Append any remaining content to the messages array
    if (currentMessage !== '') {
        messages.push(currentMessage);
    }

    return messages;
};

const repostMessages = async (channelID: string, messages: string[]) => {
    const client = getDiscordClient();
    const channel = (await client.channels.fetch(channelID)) as TextChannel;
    // Fetch and delete all existing messages
    const lastMessages = await channel.messages.fetch({ limit: 100 });
    for (const [, message] of lastMessages) {
        await message.delete();
    }
    // Repost the messages
    for (const msg of messages) {
        await channel.send(msg);
    }
};

const updateAllChannels = async () => {
    try {
        for (const [name, channelID] of Object.entries(DocsData.channels)) {
            const discordDate = await getLastUpdateDiscord(channelID);
            const docsDate = getLastUpdateDocs(name);
            if (docsDate > discordDate) {
                const path = `${__dirname}/docs/${name}.md`;
                const messages = parseFileContents(path);
                repostMessages(channelID, messages);
            }
        }
    } catch (error) {
        console.error(error);
    }
};

export const initialize = async () => {
    console.log('Started updating docs');
    await updateAllChannels();
    console.log('Finished updating docs');
};
