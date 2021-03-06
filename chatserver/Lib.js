'use strict';

module.exports.isInvalidUsername = isInvalidUsername;
function isInvalidUsername(input) {
  if (typeof input !== 'string')      return 'NOT_STRING';
  if (input.length === 0)             return 'NOT_PROVIDED';
  if (input.length < 3)               return 'TOO_SHORT';
  if (input.length > 50)              return 'TOO_LONG';
  if (!/^[a-z0-9_\-]*$/i.test(input)) return 'INVALID_CHARS';
  if (input === '__proto__')          return 'INVALID_CHARS';
  return false;
}

module.exports.isInvalidTokenHash = isInvalidTokenHash;
function isInvalidTokenHash(input) {
  if (typeof input !== 'string')
    return 'TOKEN_HASH_IS_NOT_STRING';
  if (!/^[a-z0-9]{64}$/i.test(input))
    return 'TOKEN_HASH_IS_NOT_SHA256';
  return false;
}
