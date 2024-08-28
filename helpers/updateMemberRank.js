// TODO: Pull these out to another location

// TODO
const roleMap = {
    Jade: process.env.JADE_RANK_ID,
    'Red Topaz': process.env.RED_TOPAZ_RANK_ID,
    Sapphire: process.env.SAPPHIRE_RANK_ID,
    Emerald: process.env.EMERALD_RANK_ID,
    Ruby: process.env.RUBY_RANK_ID,
    Diamond: process.env.DIAMOND_RANK_ID,
    'Dragon Stone': process.env.DRAGON_STONE_RANK_ID,
    Onyx: process.env.ONYX_RANK_ID,
    Zenyte: process.env.ZENYTE_RANK_ID,
};

const { Configuration } = require('../configuration');
const mapPointsToRank = require('./mapPointsToRank.js');
const models = require('../models');
const { WOMClient } = require('../config/wom.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function updateMemberRank(memberDiscordId, discordClient) {
    let memberData;
    let playerDetails;
    try {
        memberData = await models.Member.findOne({
            discordID: memberDiscordId,
        });

        if (!memberData) {
            console.error('Attempted to update unknown member!');
            return;
        }

        playerDetails = await WOMClient.players.getPlayerDetailsById(
            memberData.womID
        );
    } catch (error) {
        console.error('Error getting user data for update: ', error);
        return;
    }

    memberData.currentCabbages = Object.values(
        memberData.itemizedCabbages
    ).reduce((acc, val) => acc + val, playerDetails.ehp + playerDetails.ehb);

    let newRank = null;
    // TODO: Date gating is still currently disabled. Waiting on decision re: what we want to do.
    if (new Date() - memberData.registeredDate < 30 * 24 * 60 * 60 * 1000) {
        newRank = mapPointsToRank(0);
    }

    newRank = mapPointsToRank(memberData.currentCabbages);

    if (newRank != memberData.currentRank) {
        memberData.currentRank = newRank;

        // Update member's discord role
        try {
            discordGuild = await discordClient.guilds.fetch(
                Configuration.GUILD_ID
            );
            discordMember = await discordGuild.members.fetch(memberDiscordId);
            await discordMember.roles.remove(Object.values(roleMap));
            await discordMember.roles.add(roleMap[newRank]);

            // Log that user's discord rank was changed
            const logChannel = discordClient.channels.cache.get(
                Configuration.LOG_CHANNEL_ID
            );
            logChannel.send(
                `${discordClient.users.cache
                    .get(memberData.discordID)
                    .toString()}'s rank was updated on Discord to: ${newRank}`
            );
        } catch (error) {
            console.error("Error updating user's roles: ", error);
        }

        // Create in-game rank update event
        const complete = new ButtonBuilder()
            .setCustomId('completeRankUpdate')
            .setLabel('Complete')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(complete);

        const rankUpdatesChannel = discordClient.channels.cache.get(
            Configuration.RANK_UPDATES_CHANNEL
        );
        rankUpdatesChannel.send({
            content: `${discordClient.users.cache
                .get(memberData.discordID)
                .toString()} needs their rank in game updated to: ${newRank}`,
            components: [row],
        });
    }

    await memberData.save();
    return;
}

module.exports = updateMemberRank;
