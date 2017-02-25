/******************************************************************************/
/* app.js                                                                     */
/* Author: Seung Jae Lee                                                      */
/* Parts of code from                                                         */
/* https://developers.google.com/google-apps/calendar/quickstart/node         */
/******************************************************************************/

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var chrono = require('chrono-node')

// read/write access except delete for gmail, and read/write access to calendar
var SCOPES = ['https://www.googleapis.com/auth/gmail.modify',
              'https://www.googleapis.com/auth/calendar'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
        process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-calendar-nodejs-tigercal.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
    }
    // Authorize a client with the loaded credentials, then call the
    // main program.
    authorize(JSON.parse(content), main);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Parses events from all unread emails, adds them to calendar, and marks them 
 * as read.
 *
 * @param {Object} auth Authorization credentials for Google APIs.
 */
var main = function (auth) {
    // set auth as a global default
    google.options({auth: auth});
    
    google.gmail('v1').users.messages.list({ // Get unread message list
        userId: 'me',
        q: 'is:unread',
    }, function (err, res) {
        // if unread message exists
        if (!err && res && res.messages && res.messages.length) { 
            console.log('Unread message exists');
            for(var i = 0; i < res.messages.length; i++) {
                var messageId = res.messages[i].id;

                // Get content of email
                google.gmail('v1').users.messages.get({
                    userId: 'me',
                    id: messageId,
                }, function(err, result) {
                    // FIXME: Some of these might not be needed
                    if(result && result.payload && result.payload.parts 
                    && result.payload.parts.length 
                    && result.payload.parts[0].body
                    && result.payload.parts[0].body.data) {
                        // Subject/Title of email
                        var subject = result.payload.headers.find(x => x.name === 'Subject').value;
                        // Text body of the email encoded by base64
                        var encodedbody = result.payload.parts[0].body.data;
                        // Text body of the email
                        var body = Buffer.from(encodedbody, 'base64').toString("ascii");;
                        
                        // Parse event
                        // FIXME: text should be changed to body
                        var event = parseEvent({subject: subject, text: 'feb 20 5pm'});

                        // Add event to calendar
                        addEvent(event);

                        // Mark email as read by deleting UNREAD label
                        google.gmail('v1').users.messages.modify({
                            userId: 'me',
                            id: messageId,
                            resource: { removeLabelIds: ['UNREAD'] },
                        });
                    }
                });   
            }
        } else {
            console.log('No unread message exists');
        }
    });
};

/**
 * Parse event from an email object and returns event object.
 *
 * @param {Object} email The email with subject and text to parse.
 */
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

/**
 * Add given event object to calendar.
 *
 * @param {Object} event The event to add to calendar.
 */
function addEvent(event) {
    var calendar = google.calendar('v3');
    calendar.events.insert({
        calendarId: 'primary',
        resource: event,
    }, function(err, event) {
        if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
        }
        // console.log('Event created: %s', event.htmlLink);
    });
}