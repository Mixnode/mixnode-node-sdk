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


const APIError = exports;

const QUERY_STATUS = {
  PLANNING: 'PLANNING',
  RUNNING: 'RUNNING',
  FINISHED: 'FINISHED'
};

const QUERY_ERROR_STATUS = {
  USER_CANCELED: 'USER_CANCELED',
  FAILED: 'FAILED',
  SYNTAX_ERROR: 'SYNTAX_ERROR',
  GENERIC_INTERNAL_ERROR: 'GENERIC_INTERNAL_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  OUTPUT_LIMIT_EXCEEDED: 'OUTPUT_LIMIT_EXCEEDED',
  INSUFFICIENT_RESOURCES: 'INSUFFICIENT_RESOURCES',
  BLOCKED: 'BLOCKED',
  USER_ERROR: 'USER_ERROR',
  EXTERNAL_ERROR: 'EXTERNAL_ERROR',
  DIVISION_BY_ZERO: 'DIVISION_BY_ZERO',
  EXCEEDED_MEMORY_LIMIT: 'EXCEEDED_MEMORY_LIMIT',
  INPUT_LIMIT_EXCEEDED: 'INPUT_LIMIT_EXCEEDED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  FATAL_ERROR: 'FATAL_ERROR'
};

APIError._buildError = function _buildError(status, errorMsg) {
  const oError = {
    status,
    message: errorMsg
  };
  return oError;
};

/* Builds error message if status is one of statuses with errors */
APIError.getError = function getError(status, errorMsg) {
  const hasError = !!QUERY_ERROR_STATUS[status];
  if (hasError) {
    return this._buildError(status, errorMsg);
  } if (errorMsg) {
    return this._buildError(QUERY_ERROR_STATUS.FATAL_ERROR, errorMsg);
  }
};
