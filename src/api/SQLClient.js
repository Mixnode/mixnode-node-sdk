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


module.exports = (function () {
  const ApiClient = require('../ApiClient');
  const SqlString = require('../utils/SqlString');
  const error = require('./../utils/Error');

  /**
   * SQL service.
   * @module api/SQLClient
\   */

  /**
   * Constructs a new SQLClient.
   * @alias module:api/SQLClient
   * @class
   * @param {object} config  json object which contains api key for authentication
   */

  const exports = function (config) {
    this.apiClient = ApiClient.instance;
    if (!config) {
      throw new error.MissingConfiguration();
    }
    if (!config.api_key) {
      throw new error.MissingApiKey();
    }
    this.api_key = config.api_key;

    /* Async function to make calls to Mixnode Server using SQL
      @param {String} query Allows you to pass the query for execution on Mixnode service.
      1. It is a mandatory argument.
      @param {Array} vars
      1. Allows you to populate the query dynamically during runtime.
      2. It helps to prepare a query with multiple insertion points, utilizing the proper escaping for ids and values.
      2. ?? used to pass ids.
      3. ? used to pass values.
      4. This is useful if you are looking to prepare the query before actually sending it to Mixnode.
      5. It is an optional argument.
      @param {Number} nInputLimit
      1. Allows you to control the cost of queries by limiting the maximum amount of data a query can scan.
      2. Queries are automatically canceled when this limit is reached.
      3. Spcified in bytes and must be greater than or equal to 1073741824 (1 GB)
      4. It is an optional argument.
      @param {Object} oOptions
      1. optional object to send extra parameters. It supports timeout at present.
      2. It provides flexibility to stop the SDK and get partial response.
      3. Specified in milliseconds.
      4. It is an optional argument.
    */

    /* Can accept parameters in one of the order as below
    1. query
    2. query, vars
    3. query, vars, inputLimit
    4. query, vars, inputLimit, timeout
    5. query, vars, timeout
    */
    this.execute = async function (query, vars, nInputLimit, oOptions = {}) {
      let inputLimit;

      const args = arguments;
      const lastArg = args[args.length - 1];
      if (typeof (lastArg) === 'number') {
       inputLimit = lastArg;
      } else if (typeof (lastArg) === 'object') {
        if (typeof (nInputLimit) === 'number') {
          inputLimit = nInputLimit;
        } else if (typeof (vars) === 'number') {
          inputLimit = vars;
        }
        if (lastArg.timeout) {
          oOptions.timeout = lastArg.timeout;
        }
      }

      if (query === undefined || query === null) {
        throw new error.MissingQuery();
      }

      const credentials = {
        api_key: `${this.api_key}:`
      };

      if (vars) {
        query = SqlString.format(query, vars);
      }
      // pass query as query_str in POST body
      const formParams = {
        query_str: query
      };
      if (inputLimit || inputLimit === 0) {
        // pass input_limit in POST body
        formParams.input_limit = inputLimit;
      }
      return this.apiClient.callApi('/queries', 'POST', formParams, credentials, oOptions);
    };
  };

  return exports;
}());
