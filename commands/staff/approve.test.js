const { execute } = require('./approve');
const models = require('../../models');

jest.mock('../../models');

describe('commands | staff | approve', () => {
    let interaction;

    beforeEach(() => {
        jest.clearAllMocks();

        interaction = {
            deferReply: jest.fn(),
            editReply: jest.fn(),
            options: {
                getUser: jest.fn().mockReturnValue({ id: '123' }),
            },
            member: {
                roles: {
                    cache: {
                        some: jest.fn().mockReturnValue(true),
                    },
                },
            },
        };
    });

    test('When a user calls the command, then the command reply should be ephemeral', async () => {
        // Act
        await execute(interaction);

        // Assert
        expect(interaction.deferReply).toHaveBeenCalledWith({
            ephemeral: true,
        });
    });

    test('When a user is not a member of staff, then the command should exit with an appropriate message', async () => {
        // Arrange
        interaction.member.roles.cache.some.mockReturnValue(false);

        // Act
        await execute(interaction);

        // Assert
        expect(interaction.editReply).toHaveBeenCalledWith(
            'Only members of staff can use this command!'
        );
    });

    test('When the member cannot be found, then the command should notify that the user is not registered', async () => {
        // Arrange
        models.Member.findOne.mockResolvedValue(null);

        // Act
        await execute(interaction);

        // Assert
        expect(interaction.editReply).toHaveBeenCalledWith(
            'User is not registered!'
        );
    });
});
