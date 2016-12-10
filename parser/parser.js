var chrono = require('chrono-node')

// parse event details from email text
// only parses date of event
function parseEvent(email) {
    var ref = new Date();
    var results = chrono.parse(email.text, ref);
    var startTime = results[0].start.date().toISOString();
    var endTime = startTime;
    if (results[0].end) {
        endTime = results[0].end.date().toISOString();
    }
    // create event object
    var event = {
        'summary': email.subject,
        'start': {
            'dateTime': startTime,
            'timeZone': 'America/New_York',
        },
        'end': {
            'dateTime': endTime,
            'timeZone': 'America/New_York',
        },
    };
    return event;
}
