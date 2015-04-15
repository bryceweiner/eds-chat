'use strict';

export const
  ENV     = process.env.NODE_ENV || 'development',
  VERSION = require('../package.json').version;
