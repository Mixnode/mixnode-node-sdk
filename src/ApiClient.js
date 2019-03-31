module.exports = (function () {
  const request = require('request-promise');

  const error = require('./utils/Error');
  const errorUtils = require('./utils/ErrorUtils');

  const exports = function () {
    this.basePath = 'https://api.mixnode.com'.replace(/\/+$/, '');
    this.defaultHeaders = {};
    this.timeout = null;
    this.response = [];
    this.credentials = null;
    this.lag = 2000; // in ms
    this.query_id = null;
    this.start = null;
  };

  exports.prototype.destroy = function () {
    this.response = null;
  };

  exports.prototype.paramToString = function (param) {
    if (param === undefined || param === null) {
      return '';
    }
    if (param instanceof Date) {
      return param.toJSON();
    }
    return param.toString();
  };

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

  exports.prototype.isJsonMime = function (contentType) {
    return Boolean(contentType !== undefined && contentType !== null && contentType.match(/^application\/(vnd.api\+)?json(;.*)?$/i));
  };

  exports.prototype.jsonPreferredMime = function (contentTypes) {
    for (let i = 0; i < contentTypes.length; i++) {
      if (this.isJsonMime(contentTypes[i])) {
        return contentTypes[i];
      }
    }
    return contentTypes[0];
  };

  exports.prototype.isFileParam = function (param) {
    return param instanceof require('fs').ReadStream || (typeof Buffer === 'function' && param instanceof Buffer);
  };

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

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

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
    const fragment = await _this.__request(requestParams);
    if (fragment.query_id) {
      _this.query_id = fragment.query_id;
      const queryPath = `/queries/${fragment.query_id}/results/1`;
      requestParams = _this._buildRequestParams(queryPath, 'GET');
      return _this._request(requestParams);
    } if (fragment.next_page) {
      let nextPageUrl = decodeURI(fragment.next_page);
      nextPageUrl = nextPageUrl.slice(_this.basePath.length + 1);
      requestParams = _this._buildRequestParams(nextPageUrl, 'GET');
      return _this._request(requestParams);
    }
      return _this.response;
  };

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
