const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getDiscordClient } = require('../../discord');
const {
    getCabbageBreakdown,
    cabbagesUntilNext,
} = require('../../helpers/calculateCabbages');
const models = require('../../models');

const findEmoji = (client, name) => {
    const emoji = client.emojis.cache.find(
        (emoji) => emoji.name.toLowerCase() === name.toLowerCase()
    );
    return emoji || '';
};

const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const embedfield = (name, value, inline) => ({
    name: name || ' ',
    value: value || ' ',
    inline: inline || false,
});

const cabbageEmbed = (member, memberData) => {
    const client = getDiscordClient();
    const { accountProgression: account } = memberData;
    // Generate all neccesary info
    const checkmark = findEmoji(client, 'check');
    const rankEmojiName = `${memberData.currentRank
        .toLowerCase()
        .replace(/ /g, '')}Gem`;
    const rankEmoji = findEmoji(client, rankEmojiName);
    const cabbages = Math.floor(memberData.currentCabbages);
    const cabbageBreakdown = getCabbageBreakdown(memberData);
    const timestamp = Math.floor(Date.parse(memberData.updatedAt) / 1000);
    // Generate embed fields
    const achievementText = [];
    const statusText = [];
    const cabbagesText = [];
    // TODO: Do all these if-statements in a loop, info like achievement text,
    // emojiname, statustext will have to be saved elsewhere
    const cabbageEmoji = findEmoji(client, 'cabbageclassic');
    achievementText.push(`${cabbageEmoji} EHP + EHB`);
    statusText.push('-');
    cabbagesText.push(cabbageBreakdown.core);
    if (memberData.eventCabbages !== 0) {
        const bingoEmoji = findEmoji(client, 'bingo');
        achievementText.push(`${bingoEmoji} Events`);
        statusText.push('-');
        cabbagesText.push(memberData.eventCabbages);
    }
    if (account.max) {
        const maxEmoji = findEmoji(client, 'maxcape');
        achievementText.push(`${maxEmoji} Maxed`);
        statusText.push(checkmark);
        cabbagesText.push(cabbageBreakdown.max);
    }
    if (account.inferno) {
        const infernoEmoji = findEmoji(client, 'infernocape');
        achievementText.push(`${infernoEmoji} Inferno`);
        statusText.push(checkmark);
        cabbagesText.push(cabbageBreakdown.inferno);
    }
    if (account.quiver) {
        const quiverEmoji = findEmoji(client, 'quiver');
        achievementText.push(`${quiverEmoji} Quiver`);
        statusText.push(checkmark);
        cabbagesText.push(cabbageBreakdown.quiver);
    }
    if (account.blorva) {
        const blorvaEmoji = findEmoji(client, 'uwuemoji');
        achievementText.push(`${blorvaEmoji} Blorva`);
        statusText.push(checkmark);
        cabbagesText.push(cabbageBreakdown.blorva);
    }
    if (account.questCape) {
        const qpcEmoji = findEmoji(client, 'questpoint');
        achievementText.push(`${qpcEmoji} Quest Cape`);
        statusText.push(checkmark);
        cabbagesText.push(cabbageBreakdown.questCape);
    }
    if (account.adTier) {
        const adTierEmoji = findEmoji(client, 'achievement_diaries');
        achievementText.push(`${adTierEmoji} AD's`);
        statusText.push(capitalize(account.adTier));
        cabbagesText.push(cabbageBreakdown.adTier);
    }
    if (account.caTier) {
        const caTierEmoji = findEmoji(client, 'combat_achievements');
        achievementText.push(`${caTierEmoji} CA's`);
        statusText.push(capitalize(account.caTier));
        cabbagesText.push(cabbageBreakdown.caTier);
    }
    if (account.clogSlots > 0) {
        const clogEmoji = findEmoji(client, 'collection_log');
        achievementText.push(`${clogEmoji} Clog slots`);
        statusText.push(account.clogSlots);
        cabbagesText.push(cabbageBreakdown.clogSlots);
    }
    // Generate embed
    const nickname = capitalize(member.nickname);
    const nextTierAmount = cabbagesUntilNext(cabbages);
    const nextTierText = nextTierAmount > 0 ? nextTierAmount.toString() : 'N/A';
    const embed = new EmbedBuilder()
        .addFields(
            embedfield(`${rankEmoji}  ${nickname}'s profile`, ''),
            embedfield('', '**Current cabbages**:\n**Until next tier**:', true),
            embedfield('', `${cabbages}\n${nextTierText}`, true),
            embedfield('', '', true),
            embedfield('Achievements', achievementText.join('\n'), true),
            embedfield('Status', statusText.join('\n'), true),
            embedfield('Cabbages', cabbagesText.join('\n'), true),
            embedfield('', `**Last updated**: <t:${timestamp}>`)
        )
        .setColor('#11ff00')
        .setFooter({
            text: 'Brassican Bot',
            iconURL:
                'https://cdn.discordapp.com/avatars/1142496380343038108/8744d1e6497ef337b6a1a04c88148b2a.webp',
        })
        .setTimestamp();
    return embed;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cabbages')
        .setDescription('Get your current cabbage count!')
        .addUserOption((option) =>
            option
                .setName('member')
                .setDescription(
                    'The member you want to see the cabbage count of'
                )
                .setRequired(false)
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const member =
            interaction?.options?.getMember('member') || interaction.member;
        const discordID = member.id;

        // Get user's information
        let memberData;
        try {
            memberData = await models.Member.findOne({
                discordID: discordID,
            });

            if (!memberData) {
                await interaction.editReply(
                    "You aren't registered yet. Use `/register` to get signed up!"
                );
                return;
            }
        } catch (error) {
            console.error(
                'Error checking if discord ID is already registered: ',
                error
            );
            await interaction.editReply(
                'Something went wrong. Please try again.'
            );
            return;
        }

        await interaction.editReply({
            embeds: [cabbageEmbed(member, memberData)],
        });

        return;
    },
};
