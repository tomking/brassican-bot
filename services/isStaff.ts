import { GuildMember, Role } from 'discord.js';
import { Environment } from './environment';

export const isStaff = (user: GuildMember) => {
    return user.roles.cache.some(
        (role: Role) =>
            role.id === Environment.DISCORD_MOD_ROLE_ID ||
            role.id === Environment.DISCORD_CA_ROLE_ID
    );
};
