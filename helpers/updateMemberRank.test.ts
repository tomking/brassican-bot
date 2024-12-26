import { faker } from '@faker-js/faker';

import { updateMemberRank } from './updateMemberRank';
import { IMember, Member } from '../models/member';
import { getWOMClient } from '../config/wom';
import { DeepPartial } from '../utils/deepPartial';
import { PlayerDetails } from '@wise-old-man/utils';
import { Client } from 'discord.js';

jest.mock('../models/member');
jest.mock('../config/wom');
jest.mock('../services/environment', () => ({
    Environment: {},
}));

describe('helpers | updateMemberRank', () => {
    let memberDiscordId: string;
    let discordClient: Client;

    const TestHelper = {
        userHasAccountInfo: (member: DeepPartial<IMember>) => {
            (Member.findOne as jest.Mock).mockReturnValueOnce({
                womID: faker.number.int().toString(),
                discordID: memberDiscordId,
                ...member,
                save: jest.fn(),
            });
        },
        userHasWOMData: (playerDetails: DeepPartial<PlayerDetails>) => {
            (getWOMClient as jest.Mock).mockReturnValueOnce({
                players: {
                    getPlayerDetailsById: jest
                        .fn()
                        .mockReturnValueOnce(playerDetails),
                },
            });
        },
        expectAccountInfoToContain: (member: DeepPartial<IMember>) => {
            expect(
                (Member.findOne as jest.Mock).mock.results[0].value
            ).toMatchObject(member);
        },
    };

    beforeEach(() => {
        jest.resetAllMocks();

        memberDiscordId = faker.number.int().toString();
        discordClient = {
            users: {
                cache: {
                    get: jest.fn().mockReturnValue({ send: jest.fn() }),
                },
            },
            channels: {
                cache: { get: jest.fn().mockReturnValue({ send: jest.fn() }) },
            },
            guilds: {
                fetch: jest.fn().mockResolvedValue({
                    members: {
                        fetch: jest.fn().mockResolvedValue({
                            roles: {
                                cache: {
                                    get: jest.fn().mockReturnValue({
                                        id: memberDiscordId,
                                    }),
                                },
                                add: jest.fn(),
                                remove: jest.fn(),
                            },
                        }),
                    },
                }),
            },
        } as unknown as Client;
    });

    test('When a user has no inferno completions, then their account progression is automatically updated', async () => {
        // Arrange
        TestHelper.userHasAccountInfo({
            accountProgression: { inferno: false },
        });

        TestHelper.userHasWOMData({
            latestSnapshot: {
                data: {
                    bosses: {
                        tzkal_zuk: { kills: 0 },
                    },
                },
            },
        });

        // Act
        await updateMemberRank(memberDiscordId, discordClient);

        // Assert
        TestHelper.expectAccountInfoToContain({
            accountProgression: { inferno: false },
        });
    });

    test('When a user has (at least) one inferno completion, then their account progression is automatically updated', async () => {
        // Arrange
        TestHelper.userHasAccountInfo({
            accountProgression: { inferno: false },
        });

        TestHelper.userHasWOMData({
            latestSnapshot: {
                data: {
                    bosses: {
                        tzkal_zuk: { kills: 1 },
                    },
                },
            },
        });

        // Act
        await updateMemberRank(memberDiscordId, discordClient);

        // Assert
        TestHelper.expectAccountInfoToContain({
            accountProgression: { inferno: true },
        });
    });

    test('When a user is not maxed, then their account progression is automatically updated', async () => {
        // Arrange
        TestHelper.userHasAccountInfo({
            accountProgression: { max: false },
        });

        TestHelper.userHasWOMData({
            latestSnapshot: {
                data: {
                    skills: {
                        overall: { level: 2276 },
                    },
                },
            },
        });

        // Act
        await updateMemberRank(memberDiscordId, discordClient);

        // Assert
        TestHelper.expectAccountInfoToContain({
            accountProgression: { max: false },
        });
    });

    test('When a user is maxed, then their account progression is automatically updated', async () => {
        // Arrange
        TestHelper.userHasAccountInfo({
            accountProgression: { max: false },
        });

        TestHelper.userHasWOMData({
            latestSnapshot: {
                data: {
                    skills: {
                        overall: { level: 2277 },
                    },
                },
            },
        });

        // Act
        await updateMemberRank(memberDiscordId, discordClient);

        // Assert
        TestHelper.expectAccountInfoToContain({
            accountProgression: { max: true },
        });
    });
});
