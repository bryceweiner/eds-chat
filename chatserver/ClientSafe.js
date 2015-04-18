'use strict';

const assert = require('assert');

// Create a new error object, which contains an error message that is safe to
// send to the client. ClientSafeError prototypally inherits from the Error
// constructor, so every ClientSafeError object is also an instance of Error.

module.exports.ClientSafeError = ClientSafeError;
function ClientSafeError(code, message) {
  assert.strictEqual(
    typeof code, 'string',
    'You need to provide an error code with a ClientSafeError');
  assert.strictEqual(
    typeof message, 'string',
    'You need to provide an error message with a ClientSafeError');

  Error.call(this, code);
  Error.captureStackTrace(this, ClientSafeError);

  Object.defineProperty(this, 'code', {value:code});
  Object.defineProperty(this, 'message', {value:message});
}

ClientSafeError.prototype = Object.create(Error.prototype);
ClientSafeError.prototype.name = 'ClientSafeError';
ClientSafeError.prototype.constructor = ClientSafeError;

exports.assert = safeAssert;
function safeAssert(check, code, message) {
  if (!check) {
    var error = new ClientSafeError(code, message);
    Error.captureStackTrace(this, safeAssert);
    throw error;
  }
};

exports.fail = fail;
function fail(code, message) {
  var error = new ClientSafeError(code, message);
  Error.captureStackTrace(error, fail);
  throw error;
}

function test() {
  try {
    fail('my_error', 'my error description');
  } catch (e) {
    console.log(e);
    console.log('instanceof Error', e instanceof Error);
    console.log('instanceof ClientSafeError', e instanceof ClientSafeError);
    console.log('Error name:\t', e.name);
    console.log('Error code:\t', e.code);
    console.log('Error message:\t', e.message);
    console.log(e.stack);
  }
}
