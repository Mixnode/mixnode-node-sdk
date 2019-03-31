module.exports = (function () {
  const ApiClient = require('../ApiClient');
  const SqlString = require('../utils/SqlString');
  const error = require('./../utils/Error');

  const exports = function (config) {
    this.apiClient = ApiClient.instance;
    if (!config) {
      throw new error.MissingConfiguration();
    }
    if (!config.api_key) {
      throw new error.MissingApiKey();
    }
    this.api_key = config.api_key;


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

      const formParams = {
        query_str: query
      };
      if (inputLimit || inputLimit === 0) {
        formParams.input_limit = inputLimit;
      }
      return this.apiClient.callApi('/queries', 'POST', formParams, credentials, oOptions);
    };
  };

  return exports;
}());
