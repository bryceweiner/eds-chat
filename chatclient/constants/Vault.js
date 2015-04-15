'use strict';

module.exports = {
  AUTHORIZE_URL: 'https://www.moneypot.com/oauth/authorize?app_id=13&redirect_uri=' + window.document.location.href,
  API_URL:       'https://api.moneypot.com/v1',
  CHAT_APP_ID:   13,
  CHAT_HOST:     window.document.location.origin
};
