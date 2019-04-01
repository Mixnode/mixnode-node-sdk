module.exports = (function () {
  const request = require('request-promise');

  const error = require('./utils/Error');
  const errorUtils = require('./utils/ErrorUtils');

  /**
   * @module ApiClient
   */

  /**
   * Manages low level client-server communications. There should not be any need for an
   * application to use this class directly - the *Api classes provide the public API for the service. The
   * contents of this file should be regarded as internal but are documented for completeness.
   * @alias module:ApiClient
   * @class
   */
  const exports = function () {
    /**
     * The base URL against which to resolve every API call's (relative) path.
     * @type {String}
     * @default https://api.mixnode.com
     */
    this.basePath = 'https://api.mixnode.com'.replace(/\/+$/, '');
    /**
     * The default HTTP headers to be included for all API calls.
     * @type {Array.<String>}
     * @default {}
     */
    this.defaultHeaders = {};
    /**
     * The default HTTP timeout for all API calls.
     * @type {Number}
     * @default 60000
     */
    this.timeout = null;
    /**
     * Response built from API calls.
     * @type {Array.<String>}
     * @default []
     */
    this.response = [];

    /* Mixnode credential placeholder */
    this.credentials = null;
    /* Delay in sending subsequent requests in milliseconds */
    this.lag = 2000;
    /* Query id for the query sent */
    this.query_id = null;
    /* placeholder for implementing timeout */
    this.start = null;
  };

  exports.prototype.destroy = function () {
    this.response = null;
  };

  /**
   * Returns a string representation for an actual parameter.
   * @param param The actual parameter.
   * @returns {String} The string representation of <code>param</code>.
   */
  exports.prototype.paramToString = function (param) {
    if (param === undefined || param === null) {
      return '';
    }
    if (param instanceof Date) {
      return param.toJSON();
    }
    return param.toString();
  };

  /**
   * Builds full URL by appending the given path to the base URL and replacing path parameter place-holders with parameter values.
   * NOTE: query parameters are not handled here.
   * @param {String} path The path to append to the base URL.
   * @param {Object} pathParams The parameter values to append.
   * @returns {String} The encoded path with parameter values substituted.
   */
  exports.prototype.buildUrl = function (path, pathParams) {
    if (!path.match(/^\//)) {
      path = `/${path}`;
    }
    let url = this.basePath + path;
    const _this = this;
    url = url.replace(/\{([\w-]+)}/g, (fullMatch, key) => {
      let value;
      if (pathParams.hasOwnProperty(key)) {
        value = _this.paramToString(pathParams[key]);
      } else {
        value = fullMatch;
      }
      return encodeURIComponent(value);
    });
    return url;
  };

  /**
   * Checks whether the given content type represents JSON.<br>
   * JSON content type examples:<br>
   * <ul>
   * <li>application/json</li>
   * <li>application/json; charset=UTF8</li>
   * <li>APPLICATION/JSON</li>
   * </ul>
   * @param {String} contentType The MIME content type to check.
   * @returns {Boolean} <code>true</code> if <code>contentType</code> represents JSON, otherwise <code>false</code>.
   */
  exports.prototype.isJsonMime = function (contentType) {
    return Boolean(contentType !== undefined && contentType !== null && contentType.match(/^application\/(vnd.api\+)?json(;.*)?$/i));
  };

  /**
   * Chooses a content type from the given array, with JSON preferred; i.e. return JSON if included, otherwise return the first.
   * @param {Array.<String>} contentTypes
   * @returns {String} The chosen content type, preferring JSON.
   */
  exports.prototype.jsonPreferredMime = function (contentTypes) {
    for (let i = 0; i < contentTypes.length; i++) {
      if (this.isJsonMime(contentTypes[i])) {
        return contentTypes[i];
      }
    }
    return contentTypes[0];
  };

  /**
   * Checks whether the given parameter value represents file-like content.
   * @param param The parameter to check.
   * @returns {Boolean} <code>true</code> if <code>param</code> represents a file.
   */
  exports.prototype.isFileParam = function (param) {
    return param instanceof require('fs').ReadStream || (typeof Buffer === 'function' && param instanceof Buffer);
  };

  /**
   * Normalizes parameter values:
   * <ul>
   * <li>remove nils</li>
   * <li>keep files and arrays</li>
   * <li>format to string with `paramToString` for other cases</li>
   * </ul>
   * @param {Object.<String, Object>} params The parameters as object properties.
   * @returns {Object.<String, Object>} normalized parameters.
   */
  exports.prototype.normalizeParams = function (params) {
    const newParams = {};
    for (const key in params) {
      if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== null) {
        const value = params[key];
        if (this.isFileParam(value) || Array.isArray(value)) {
          newParams[key] = value;
        } else {
          newParams[key] = this.paramToString(value);
        }
      }
    }
    return newParams;
  };

  /**
   * Enable working in debug mode
   * To activate, simple set Mixnode.setDebug(true);
   */
  exports.prototype.debug = function debug() {
    if (this.isDebugMode) {
      const args = Array.prototype.slice.call(arguments);
      args.map((arg) => {
        if (typeof arg === 'string') {
          console.log(`${arg}: `);
        } else {
          console.log(arg);
        }
      });
    }
  };

  /* Builds Mixnode raw response to array of objects where objects are
  based on columns of the tables requested via query */
  const _buildRecords = function (rawResponse) {
    const records = [];
    (rawResponse.rows || []).forEach((row) => {
        const record = {};
        (rawResponse.columns || []).forEach((column, index) => {
            record[column.name] = row[index];
        });
        records.push(record);
    });
    return records;
  };

  /* promise instance to delay the subsequent requests */
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  /* Async function to make API calls using npm request-promise library */
  exports.prototype.__request = async function __request(requestParams) {
    const _this = this;
    let payload;
    try {
      payload = await request(requestParams);
    } catch (err) {
      throw new error.MixnodeError(err);
    }
    await wait(_this.lag);
    payload = JSON.parse(payload);

    const oError = errorUtils.getError(payload.status, payload.error_msg);

    if (oError) {
      throw new error.MixnodeError(oError.message, { status: oError.status });
    } else {
      _this.response = _this.response.concat(_buildRecords(payload));
      return payload;
    }
  };

  /* Function to handle as below:
  1. timeout if supplied by the user wants to cancel the query after certain period of time
  2. handles paging response from Mixnode server.
    Find more about it here https://www.mixnode.com/docs/sql-api/queries
  */
  exports.prototype._request = async function _request(requestParams) {
    const _this = this;
    const current = Date.now();
    if (_this.timeout && current - _this.start > _this.timeout) {
      if (_this.query_id) {
        try {
          const queryPath = `/queries/${_this.query_id}/cancel`;
          const requestCancelParams = _this._buildRequestParams(queryPath, 'POST');
          await _this.__request(requestCancelParams);
        } catch (e) {
          /* Do nothing here since cancel request has been assumed to work without errors.
          In case the cancel request has errors, query will time out in the back end since it
          will not receive any page requests.
          */
        }
        _this.response.message = 'Query was cancelled due to user defined timeout. You may have incomplete response.';
        return _this.response;
      }
        throw new error.QueryTimeout();
    }
    // Fires first POST request with parameters
    const fragment = await _this.__request(requestParams);

    // First POST request should give back query id
    if (fragment.query_id) {
      _this.query_id = fragment.query_id;
      // Once we have the query id, fire page 1 GET request
      const queryPath = `/queries/${fragment.query_id}/results/1`;
      requestParams = _this._buildRequestParams(queryPath, 'GET');
      return _this._request(requestParams);
    }
    /* Subsequent requests should have next_page attribute along with the paging
    information to make subsequent calls.
    */
    if (fragment.next_page) {
      let nextPageUrl = decodeURI(fragment.next_page);
      nextPageUrl = nextPageUrl.slice(_this.basePath.length + 1);
      requestParams = _this._buildRequestParams(nextPageUrl, 'GET');
      return _this._request(requestParams);
    }
    /* returns the built response once the next_page attribute is
    not a part of response from previous requests
    */
    return _this.response;
  };

  /* Function to build request parameters
  Accepts query path concatenating to base path, http method and body if POST request.
  */
  exports.prototype._buildRequestParams = function _buildRequestParams(path, httpMethod, formParams) {
    const requestParams = {};
    const contentTypes = ['application/json'];
    requestParams.uri = this.buildUrl(path);
    requestParams.method = httpMethod;
    const headers = {};
    headers.Authorization = `Basic ${Buffer.from(this.credentials.api_key).toString('base64')}`;

    const contentType = this.jsonPreferredMime(contentTypes);
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    if (formParams && contentType === 'application/json') {
      requestParams.form = this.normalizeParams(formParams);
    }

    this.debug('request params were', requestParams);

    requestParams.headers = Object.assign(headers);
    return requestParams;
  };

  /**
   * Invokes the REST service using the supplied settings and parameters.
   * @param {String} path The base URL to invoke.
   * @param {String} httpMethod The HTTP method to use.
   * @param {Object.<String, Object>} formParams A map of form parameters and their values.
   * @param {Object} credentials has the API key to Mixnode server.
   * @param {Object} oOptions optional parameter for the call.
   * @returns {Object} A Promise object.
   */
  exports.prototype.callApi = async function callApi(path, httpMethod, formParams, credentials, oOptions) {
    const _this = this;
    _this.credentials = credentials;
    _this.timeout = oOptions && oOptions.timeout;
    _this.start = Date.now();
    const requestParams = _this._buildRequestParams(path, httpMethod, formParams);
    return _this._request(requestParams);
  };

  exports.instance = new exports();

  return exports;
}());
