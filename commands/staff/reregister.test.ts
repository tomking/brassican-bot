import { ChatInputCommandInteraction } from 'discord.js';
import type { Mock } from 'vitest';

import { execute } from './reregister';
import { getWOMClient } from '../../config/wom';
import { updateMemberRank } from '../../helpers/updateMemberRank';
import { Member } from '../../models/member';

vi.mock('../../models/member');
vi.mock('../../config/wom');
vi.mock('../../helpers/updateMemberRank');
vi.mock('../../services/environment', () => ({
    Environment: {
        LOG_CHANNEL_ID: 'test-log-channel',
    },
}));

describe('commands | staff | reregister', () => {
    let interaction: ChatInputCommandInteraction;
    let accessMock: Mock;

    beforeEach(() => {
        vi.clearAllMocks();

        accessMock = vi.fn();

        interaction = {
            deferReply: vi.fn(),
            editReply: vi.fn(),
            client: {
                channels: {
                    cache: {
                        get: vi.fn().mockReturnValue({ send: vi.fn() }),
                    },
                },
            },
            options: {
                getUser: vi.fn().mockReturnValue({
                    id: '123',
                    toString: () => '<@123>',
                }),
                getString: vi.fn().mockReturnValue('Some RSN'),
            },
            member: {
                toString: () => '<@999>',
                roles: {
                    cache: {
                        some: accessMock.mockReturnValue(true),
                    },
                },
            },
        } as unknown as ChatInputCommandInteraction;
    });

    test('When a user calls the command, then the command reply should be ephemeral', async () => {
        // Act
        await execute(interaction);

        // Assert
        expect(interaction.deferReply).toHaveBeenCalledWith({
            flags: 'Ephemeral',
        });
    });

    test('When a user is not a member of staff, then the command should exit with an appropriate message', async () => {
        // Arrange
        accessMock.mockReturnValue(false);

        // Act
        await execute(interaction);

        // Assert
        expect(interaction.editReply).toHaveBeenCalledWith(
            'Only members of staff can use this command!'
        );
    });

    test('When the member cannot be found, then the command should notify that the user is not registered', async () => {
        // Arrange
        (Member.findOne as Mock).mockResolvedValue(null);

        // Act
        await execute(interaction);

        // Assert
        expect(interaction.editReply).toHaveBeenCalledWith(
            'User is not registered!'
        );
    });

    test('When WOM cannot find the provided rsn, then the command should notify with an rsn-specific error', async () => {
        // Arrange
        (Member.findOne as Mock).mockResolvedValueOnce({
            discordID: '123',
            womID: '100',
            save: vi.fn(),
        });

        const notFoundError = new Error('Not Found');
        notFoundError.name = 'NotFoundError';

        (getWOMClient as Mock).mockReturnValue({
            players: {
                getPlayerDetails: vi.fn().mockRejectedValueOnce(notFoundError),
            },
        });

        // Act
        await execute(interaction);

        // Assert
        expect(interaction.editReply).toHaveBeenCalledWith(
            'Unable to find a WOM profile for RSN: `Some RSN`.'
        );
    });

    test('When both the discord user and wom rsn are valid, then the member should be updated and rank refresh should run', async () => {
        // Arrange
        const save = vi.fn();
        (Member.findOne as Mock)
            .mockResolvedValueOnce({
                discordID: '123',
                womID: '100',
                save,
            })
            .mockResolvedValueOnce(null);

        (getWOMClient as Mock).mockReturnValue({
            players: {
                getPlayerDetails: vi.fn().mockResolvedValueOnce({
                    id: 555,
                    displayName: 'New Name',
                    username: 'New Name',
                }),
            },
        });

        // Act
        await execute(interaction);

        // Assert
        expect(save).toHaveBeenCalled();
        expect(updateMemberRank).toHaveBeenCalledWith(
            '123',
            interaction.client
        );
        expect(interaction.editReply).toHaveBeenCalledWith(
            '<@123> is now connected to WiseOldMan RSN `New Name`.'
        );
    });
});
