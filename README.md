# Tigercal
## Description
Calendar for all things Princeton

## Installation
The app uses Node.js. In addition, it requires a few packages to be installed to run.
```
npm install googleapis --save
npm install google-auth-library --save
npm install chrono-node --save
```

## API Setup
Because the app uses Gmail API and Google Calendar API, it is necessary to get authorization from the account to read/write emails and calendar events. Here are the steps to setup the API from [API Quickstart](https://developers.google.com/gmail/api/quickstart/nodejs):
  1. Use this [wizard](https://console.developers.google.com/start/api?id=gmail) to create or select a project in the Google Developers Console and automatically turn on the API. Click __Continue__, then __Go to credentials__.
  2. On the __Add credentials to your project page__, click the __Cancel__ button.
  3. At the top of the page, select the __OAuth consent screen__ tab. Select an __Email address__, enter a __Product name__ if not already set, and click the __Save__ button.
  4. Select the __Credentials__ tab, click the __Create credentials__ button and select __OAuth client ID__.
  5. Select the application type __Other__, enter the name "Gmail API Quickstart", and click the __Create__ button.
  6. Click __OK__ to dismiss the resulting dialog.
  7. Click the download button to the right of the client ID.
  8. Move this file to your working directory and rename it client_secret.json.
  
## Running
```
node app.js
```
When the app is run for the first time, you need to authorize access for reading and writing emails and calendar events. Here are the steps to authorize access from [API Quickstart](https://developers.google.com/gmail/api/quickstart/nodejs).
  1. Browse to the provided URL in your web browser.
  2. If you are not already logged into your Google account, you will be prompted to log in. If you are logged into multiple Google accounts, you will be asked to select one account to use for the authorization.
  3. Click the __Accept__ button.
  4. Copy the code you're given, paste it into the command-line prompt, and press __Enter__.

The credentials are saved in a folder called __credentials__ in the home directory with the name __gmail-calendar-nodejs-tigercal.json__.
