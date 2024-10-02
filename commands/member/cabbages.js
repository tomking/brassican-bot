const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getDiscordClient } = require('../../discord');
const { calculateCurrentCabbages } = require('../../helpers/calculateCabbages');
const models = require('../../models');

const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const inlinefield = (name, value) => ({
    name: name || ' ',
    value: value || ' ',
    inline: true,
});

const cabbageEmbed = (interaction, memberData) => {
    // TODO: create a function to search emojis which online compares their lowercase name
    const client = getDiscordClient();
    const { accountProgression: account } = memberData;
    // Generate all neccesary info
    const { nickname } = interaction.member;
    const checkmark = client.emojis.cache.find(
        (emoji) => emoji.name === 'check'
    );
    const rankEmojiName = `${memberData.currentRank
        .toLowerCase()
        .replace(/ /g, '')}Gem`;
    const rankEmoji =
        client.emojis.cache.find((emoji) => emoji.name === rankEmojiName) || '';
    const cabbages = Math.floor(memberData.currentCabbages);
    const cabbageBreakdown = calculateCurrentCabbages(memberData);
    // Generate embed fields
    const achievementText = [];
    const statusText = [];
    const cabbagesText = [];
    let currEmoji;
    if (true) {
        currEmoji = client.emojis.cache.find(
            (emoji) => emoji.name === 'cabbageclassic'
        );
        achievementText.push(`${currEmoji} EHP + EHB`);
        statusText.push('-');
        cabbagesText.push(cabbageBreakdown.core);
    }
    if (memberData.eventCabbages > 0) {
        currEmoji = client.emojis.cache.find((emoji) => emoji.name === 'BINGO');
        achievementText.push(`${currEmoji} Events`);
        statusText.push('-');
        cabbagesText.push(memberData.eventCabbages);
    }
    if (account.max) {
        currEmoji = client.emojis.cache.find(
            (emoji) => emoji.name === 'maxCape'
        );
        achievementText.push(`${currEmoji} Maxed`);
        statusText.push(checkmark);
        cabbagesText.push(cabbageBreakdown.max);
    }
    if (account.inferno) {
        currEmoji = client.emojis.cache.find(
            (emoji) => emoji.name === 'infernoCape'
        );
        achievementText.push(`${currEmoji} Inferno`);
        statusText.push(checkmark);
        cabbagesText.push(cabbageBreakdown.inferno);
    }
    if (account.quiver) {
        currEmoji = client.emojis.cache.find(
            (emoji) => emoji.name === 'Quiver'
        );
        achievementText.push(`${currEmoji} Quiver`);
        statusText.push(checkmark);
        cabbagesText.push(cabbageBreakdown.quiver);
    }
    if (account.blorva) {
        currEmoji = client.emojis.cache.find(
            (emoji) => emoji.name === 'uwuemoji'
        );
        achievementText.push(`${currEmoji} Blorva`);
        statusText.push(checkmark);
        cabbagesText.push(cabbageBreakdown.blorva);
    }
    if (account.questCape) {
        currEmoji = client.emojis.cache.find((emoji) => emoji.name === 'dogo');
        achievementText.push(`${currEmoji} Quest Cape`);
        statusText.push(checkmark);
        cabbagesText.push(cabbageBreakdown.questCape);
    }
    if (account.clogSlots > 0) {
        currEmoji = client.emojis.cache.find(
            (emoji) => emoji.name === 'Collection_log'
        );
        achievementText.push(`${currEmoji} Clog slots`);
        statusText.push(account.clogSlots);
        cabbagesText.push(cabbageBreakdown.clogSlots);
    }
    if (account.caTier) {
        currEmoji = client.emojis.cache.find(
            (emoji) => emoji.name === 'Combat_achievements'
        );
        achievementText.push(`${currEmoji} CA's`);
        statusText.push(capitalize(account.caTier));
        cabbagesText.push(cabbageBreakdown.caTier);
    }
    if (account.adTier) {
        currEmoji = client.emojis.cache.find(
            (emoji) => emoji.name === 'Achievement_Diaries'
        );
        achievementText.push(`${currEmoji} AD's`);
        statusText.push(capitalize(account.adTier));
        cabbagesText.push(cabbageBreakdown.adTier);
    }
    // Generate embed
    const embed = new EmbedBuilder()
        .addFields(
            {
                name: `${rankEmoji}  ${capitalize(nickname)}'s profile`,
                value: ' ',
            },
            inlinefield('', '**Current cabbages**:\n**Until next tier**:'),
            inlinefield('', `${cabbages}\nnot yet implemented`),
            inlinefield('', ''),
            inlinefield('Achievements', achievementText.join('\n')),
            inlinefield('Status', statusText.join('\n')),
            inlinefield('Cabbages', cabbagesText.join('\n'))
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
        .setDescription('Get your current cabbage count!'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const discordID = interaction.user.id;

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
            embeds: [cabbageEmbed(interaction, memberData)],
        });

        return;
    },
};
