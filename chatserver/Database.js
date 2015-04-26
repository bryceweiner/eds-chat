'use strict';

const config     = require('../config').chatapp;
const debug      = require('debug')('chat:db');
const CBuffer    = require('CBuffer');
const clientSafe = require('./ClientSafe');

let apps =
  {
    1: { name: 'dustdice', channels: [1] },
    18: { name: 'untitled-dice', channels: [2] }
  };

let channels =
  {
    1: { 
      name: 'general',
      history: new CBuffer(config.CHAT_HISTORY_SIZE)
    },
    2: {
      name: 'general',
      history: new CBuffer(config.CHAT_HISTORY_SIZE)
    }
  };

module.exports.getAppById = getAppById;
function *getAppById(appId) {
  debug('getAppById %d', appId);

  clientSafe.assert(
    apps.hasOwnProperty(appId),
    'APP_ID_INVALID',
    'The application id you provided is invalid. Please verify.');

  return apps[appId];
}

module.exports.getAppByName = getAppByName;
function *getAppByName(appName) {
  debug('getAppByName %s', appName);

  for (let appId in apps)
    if (apps[appId].name === appName)
      return apps[appId];

  clientSafe.fail('APP_NAME_INVALID', 'The application could not be found');
}

module.exports.getChannel = getChannel;
function *getChannel(appId, channelName) {
  debug('getChannel %d#%s', appId, channelName);

  let app = yield getAppById(appId);

  for (let channelId of app.channels) {
    let channel = channels[channelId];
    if (channel.name === channelName)
      return { cid: channelId };
  }

  clientSafe.fail(
    'CHANNEL_NAME_INVALID',
    'There is no channel with that name associated with the application.');
}

module.exports.getHistory = getHistory;
function *getHistory(channelId) {
  debug('getHistory %d', channelId);

  clientSafe.assert(
    channels.hasOwnProperty(channelId),
    'CHANNEL_ID_INVALID',
    'The application id you provided is invalid. Please verify.');

  return channels[channelId].history.toArray();
}

module.exports.insertMessage = insertMessage;
function *insertMessage(message) {
  debug('insertMessage %s', JSON.stringify(message));

  let cid = message.cid;
  clientSafe.assert(
    channels.hasOwnProperty(cid),
    'CHANNEL_ID_INVALID',
    'The application id you provided is invalid. Please verify.');

  let channel = channels[cid];
  channel.history.push(message);
}
