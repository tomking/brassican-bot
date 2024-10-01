const { Environment } = require('../services/environment.js');
const Configuration = require('../config.json');
const mapPointsToRank = require('./mapPointsToRank.js');
const models = require('../models');
const { getWOMClient } = require('../config/wom.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function updateMemberRank(memberDiscordId, discordClient) {
    // TODO: Pull these out to another location
    const roleMap = {
        Jade: Environment.JADE_RANK_ID,
        'Red Topaz': Environment.RED_TOPAZ_RANK_ID,
        Sapphire: Environment.SAPPHIRE_RANK_ID,
        Emerald: Environment.EMERALD_RANK_ID,
        Ruby: Environment.RUBY_RANK_ID,
        Diamond: Environment.DIAMOND_RANK_ID,
        'Dragon Stone': Environment.DRAGON_STONE_RANK_ID,
        Onyx: Environment.ONYX_RANK_ID,
        Zenyte: Environment.ZENYTE_RANK_ID,
    };

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

        const womClient = getWOMClient();
        playerDetails = await womClient.players.getPlayerDetailsById(
            memberData.womID
        );
    } catch (error) {
        console.error('Error getting user data for update: ', error);
        return;
    }

    // Calculate current cabbages
    let cabbageCount =
        playerDetails.ehp + playerDetails.ehb + memberData.eventCabbages;
    if (memberData.accountProgression.max)
        cabbageCount += Configuration.maxCabbages;
    if (memberData.accountProgression.inferno)
        cabbageCount += Configuration.infernoCabbages;
    if (memberData.accountProgression.quiver)
        cabbageCount += Configuration.quiverCabbages;
    if (memberData.accountProgression.blorva)
        cabbageCount += Configuration.blorvaCabbages;
    if (memberData.accountProgression.questCape)
        cabbageCount += Configuration.questCapeCabbages;
    cabbageCount +=
        Math.floor(memberData.accountProgression.clogSlots / 100) * 20;
    cabbageCount +=
        Configuration.caTierCabbages[memberData.accountProgression.caTier] || 0;
    cabbageCount +=
        Configuration.adTierCabbages[memberData.accountProgression.adTier] || 0;
    memberData.currentCabbages = cabbageCount;

    let newRank = null;

    newRank = mapPointsToRank(memberData.currentCabbages);

    if (newRank !== memberData.currentRank) {
        memberData.currentRank = newRank;

        // Update member's discord role
        try {
            discordGuild = await discordClient.guilds.fetch(
                Environment.GUILD_ID
            );
            discordMember = await discordGuild.members.fetch(memberDiscordId);
            await discordMember.roles.remove(Object.values(roleMap));
            await discordMember.roles.add(roleMap[newRank]);

            // Log that user's discord rank was changed
            const logChannel = discordClient.channels.cache.get(
                Environment.LOG_CHANNEL_ID
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
            Environment.RANK_UPDATES_CHANNEL
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
