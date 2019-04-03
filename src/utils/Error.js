/**
 * Mixnode Node SDK
 * Turn the web into a database
 * A fast, flexible and massively scalable platform to extract and analyze data from the web.
 *
 * Contact: hi@mixnode.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


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
