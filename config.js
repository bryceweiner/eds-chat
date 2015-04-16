'use strict';

const fs = require('fs');

for (let file of fs.readdirSync('config')) {
  let match = file.match(/^(.*)\.js$/);
  if (!match) continue;

  let basename = match[1];
  console.log('Reading config/' + file);
  exports[basename] = require('./config/'+basename);
}
