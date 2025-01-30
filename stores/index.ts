import * as path from 'node:path';

import mongoose from 'mongoose';
import { config, database, up } from 'migrate-mongo';

import { Environment } from '../services/environment';

export type CA_TIER =
    | 'EASY'
    | 'MEDIUM'
    | 'HARD'
    | 'ELITE'
    | 'MASTER'
    | 'GRANDMASTER';

export type AD_TIER = 'EASY' | 'MEDIUM' | 'HARD' | 'ELITE';

export interface IMember extends mongoose.Document {
    womID: string;
    discordID: string;
    currentCabbages: number;
    currentRank: string;
    eventCabbages: number;
    accountProgression: {
        max: boolean;
        inferno: boolean;
        quiver: boolean;
        blorva: boolean;
        questCape: boolean;
        clogSlots: number;
        caTier: CA_TIER;
        adTier: AD_TIER;
    };
    updatedAt: string;
    createdAt: string;
}

export interface IScheduler extends mongoose.Document {
    command: string;
    arguments: JSON;
    date: Date;
}

export const SchedulerSchema = new mongoose.Schema<IScheduler>({
    command: { type: String, required: true },
    arguments: { type: JSON, required: true },
    date: { type: Date, required: true },
}).set('timestamps', true);

const MemberSchema = new mongoose.Schema<IMember>({
    womID: { type: String, required: true },
    discordID: { type: String, required: true },
    currentCabbages: { type: Number, default: 0 },
    currentRank: { type: String, default: null },
    eventCabbages: { type: Number, default: 0 },
    accountProgression: {
        max: { type: Boolean, default: false },
        inferno: { type: Boolean, default: false },
        quiver: { type: Boolean, default: false },
        blorva: { type: Boolean, default: false },
        questCape: { type: Boolean, default: false },
        clogSlots: { type: Number, default: 0 },
        caTier: { type: String, default: null, uppercase: true }, // For example "GRANDMASTER"
        adTier: { type: String, default: null, uppercase: true }, // For example "MEDIUM"
    },
}).set('timestamps', true);

export const Member = mongoose.model<IMember>('Member', MemberSchema);

export const Scheduler = mongoose.model<IScheduler>(
    'Scheduler',
    SchedulerSchema
);

export const initialize = async () => {
    try {
        await mongoose.connect(Environment.MONGO_URL, {
            dbName: Environment.CABBAGE_DB_NAME,
        });
    } catch (error) {
        console.error('Database connection failed: ', error);
        return;
    }

    config.set({
        mongodb: {
            url: Environment.MONGO_URL,
            databaseName: Environment.CABBAGE_DB_NAME,
            options: {},
        },
        migrationsDir: path.join(path.resolve(), 'stores', 'migrations'),
        changelogCollectionName: 'changelog',
        migrationFileExtension: '.ts',
    });

    const { db, client } = await database.connect();
    await up(db, client);
};

export const getMongooseClient = () => {
    return mongoose;
};
