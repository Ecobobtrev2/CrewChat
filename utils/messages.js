const moment = require('moment');

function formatMessage(username, text, month) {
    return {
        username,
        text,
        time: moment().format('MMM Do YY h:mm a'),
    };
}

module.exports = formatMessage;