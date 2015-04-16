'use strict';

module.exports =
  {
    ENV:     process.env.NODE_ENV || 'development',
    VERSION: require('../package.json').version
  };
