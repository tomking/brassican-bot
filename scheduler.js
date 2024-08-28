const cron = require('node-cron');

const updateAllMemberRanks = require('./helpers/updateAllMemberRanks');

const initialize = () => {
    // Schedule a job to run every Monday at 00:00 UTC to update all member's cabbage counts
    cron.schedule(
        '0 0 * * 1',
        () => {
            console.log(
                `Running scheduled job to update all member's cabbage counts`
            );
            updateAllMemberRanks(client);
        },
        {
            scheduled: true,
            timezone: 'UTC',
        }
    );
};

module.exports = {
    initialize,
};
