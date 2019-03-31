

const inherits = require('inherits');

function MixnodeError(message, extraProperties) {
  const error = this;

  // TODO: Make this design better
  let statusMessage;
  if (message.response && message.response.statusCode >= 400) {
    const body = JSON.parse(message.response.body);
    if (body && body.errors) {
      statusMessage = body.errors.message;
      this.code = body.errors.code;
    }
    this.statusCode = message.response.statusCode;
  }

  // try to get a stacktrace
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  } else {
    error.stack = (new Error()).stack || 'Cannot get a stacktrace';
  }

  this.name = 'MixnodeError';
  this.message = statusMessage || message || 'Unknown error';
  if (extraProperties) {
    this.status = extraProperties.status;
  }
}

inherits(MixnodeError, Error);

function createCustomError(name, message) {
  function MixnodeCustomError() {
    const args = Array.prototype.slice.call(arguments, 0);

    // custom message not set, use default
    if (typeof args[0] !== 'string') {
      args.unshift(message);
    }

    MixnodeError.apply(this, args);
    this.name = `Mixnode: ${name} Error`;
  }

  inherits(MixnodeCustomError, MixnodeError);

  return MixnodeCustomError;
}

// late exports to let various fn defs and inherits take place
module.exports = {
  MixnodeError,
  RequestTimeout: createCustomError('RequestTimeout',
    'Request timed out before getting a response'),
  Network: createCustomError('Network',
    'Network issue, see err.more for details'),
  MissingApiKey: createCustomError('MissingApiKey',
    'Missing api_key definition in the configuration while instantiating Mixnode Client'),
  MissingConfiguration: createCustomError('MissingConfiguration',
    'Missing configuration while instantiating Mixnode Client'),
  MissingQuery: createCustomError('MissingQuery',
    'Missing the required parameter (query) on calling execute'),
  QueryTimeout: createCustomError('QueryTimeout',
    'Query was cancelled due to user defined timeout'),
  Unknown: createCustomError('Unknown',
    'Unknown error occured')
};
