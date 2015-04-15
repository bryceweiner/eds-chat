'use strict';

export function isInvalidUsername(input) {
  if (typeof input !== 'string')      return 'NOT_STRING';
  if (input.length === 0)             return 'NOT_PROVIDED';
  if (input.length < 3)               return 'TOO_SHORT';
  if (input.length > 50)              return 'TOO_LONG';
  if (!/^[a-z0-9_\-]*$/i.test(input)) return 'INVALID_CHARS';
  if (input === '__proto__')          return 'INVALID_CHARS';
  return false;
}
