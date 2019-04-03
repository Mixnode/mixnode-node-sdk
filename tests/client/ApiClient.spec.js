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


const nock = require('nock');
const Mixnode = require('./../../src/index');
const config = require('./../test.config.js');

let SQLClient;
let ApiClient;
const query = 'Select url from pages limit 2';
const ApiClientFixtures = require('./../fixtures/ApiClientJsonData');

describe('Functions are defined', () => {
    beforeAll(() => {
        if (jasmine.DEFAULT_TIMEOUT_INTERVAL <= 50000) {
             jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
        }
    });

    afterAll(() => {
        if (jasmine.DEFAULT_TIMEOUT_INTERVAL > 50000) {
             jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;
        }
    });

    beforeEach(() => {
        SQLClient = new Mixnode.SQLClient(config);
        ApiClient = SQLClient.apiClient;
    });
    describe('ApiClient functions are defined', () => {
        describe('properties', () => {
            it('should have basePath property', () => {
                expect(Object.keys(ApiClient)).toContain('basePath');
            });
            it('should have timeout property', () => {
                expect(Object.keys(ApiClient)).toContain('timeout');
            });
            it('should have query_id property', () => {
                expect(Object.keys(ApiClient)).toContain('query_id');
            });
            it('should have defaultHeaders property', () => {
                expect(Object.keys(ApiClient)).toContain('defaultHeaders');
            });
            it('should have response property', () => {
                expect(Object.keys(ApiClient)).toContain('response');
            });
            it('should have lag property', () => {
                expect(Object.keys(ApiClient)).toContain('lag');
            });
            it('should have start property', () => {
                expect(Object.keys(ApiClient)).toContain('start');
            });
        });

        describe('paramToString method', () => {
            it('should work for a non-empty param', () => {
                const a = 9;
                const now = new Date();
                expect(ApiClient.paramToString(a)).toEqual('9');
                expect(ApiClient.paramToString(now)).toEqual(now.toJSON());
            });
            it('should fail for empty param', () => {
                const a = null;
                    let b;
                expect(ApiClient.paramToString(a)).toEqual('');
                expect(ApiClient.paramToString(b)).toEqual('');
            });
        });

        describe('buildUrl method', () => {
            it('should work for a qualified URL', () => {
                const path = '/test/{p1}/{p2}';
                    const pathParams = { p1: 'foo', p2: true };

                expect(ApiClient.buildUrl(path, pathParams)).toEqual(`${ApiClient.basePath}/test/foo/true`);
            });

            it('should ignore pathParams when URL is not qualified', () => {
                const path = '/test';
                    const pathParams = { p1: 'foo', p2: true };

                expect(ApiClient.buildUrl(path, pathParams)).toEqual(`${ApiClient.basePath}/test`);
            });
        });

        describe('isJsonMime method', () => {
            it('should return true for a json mime', () => {
                expect(ApiClient.isJsonMime('application/json')).toEqual(true);
            });

            it('should return false for a non-json mime', () => {
                expect(ApiClient.isJsonMime('application/xml')).toEqual(false);
            });
        });

        describe('jsonPreferredMime method', () => {
            it('should return the json mime if it is present in an array', () => {
                const mimeTypes = ['application/xml', 'application/json', 'application/x-www-form-urlencoded'];
                expect(ApiClient.jsonPreferredMime(mimeTypes)).toEqual('application/json');
            });

            it('should return the first json mime if it is present in an array', () => {
                const mimeTypes = ['application/xml', 'application/json', 'application/vnd.api+json', 'application/x-www-form-urlencoded'];
                expect(ApiClient.jsonPreferredMime(mimeTypes)).toEqual('application/json');
            });

            it('should return the first mime if json is not present in an array', () => {
                const mimeTypes = ['application/xml', 'application/x-www-form-urlencoded'];
                expect(ApiClient.jsonPreferredMime(mimeTypes)).toEqual('application/xml');
            });

            it('should fail for a an empty array', () => {
                expect(ApiClient.jsonPreferredMime([])).toBeFalsy();
            });
        });

        describe('isFileParam method', () => {
            it('should return false for a non-file type', () => {
                expect(ApiClient.isFileParam('foo')).toBe(false);
                expect(ApiClient.isFileParam(true)).toBe(false);
                expect(ApiClient.isFileParam(3)).toBe(false);
            });
        });

        describe('normalizeParams method', () => {
            it('should normalize objects', () => {
                expect(ApiClient.normalizeParams({ foo: 'bar', baz: true })).toEqual({ foo: 'bar', baz: 'true' });
            });

            it('should normalize arrays', () => {
                expect(ApiClient.normalizeParams({ foo: ['abc', true] })).toEqual({ foo: ['abc', true] });
            });
        });

        describe('debug method', () => {
            it('able to work in debug mode', () => {
                spyOn(console, 'log');
                ApiClient.isDebugMode = true;
                ApiClient.debug('foo');
                ApiClient.debug(10);
                expect(console.log).toHaveBeenCalled();
            });
        });

        describe('callApi method', () => {
            const queryPath = '/queries';
            const formParams = { query_str: query };
            const { query_id } = ApiClientFixtures.dummyQueryObject;
            const page1Path = `/queries/${query_id}/results/1`;
            const page2Path = `/queries/${query_id}/results/2`;

            beforeAll(() => {
                nock(ApiClient.basePath)
                    .post(queryPath, body => JSON.stringify(body.query_str) === JSON.stringify(formParams.query_str))
                    .reply(200, ApiClientFixtures.dummyQueryObject)
                    .get(page1Path)
                    .reply(200, ApiClientFixtures.dummyPage1Response)
                    .get(page2Path)
                    .reply(200, ApiClientFixtures.dummyPage2Response);
            });

            afterAll(() => {
                nock.restore();
            });

            it('able to call api successfully', (done) => {
                const httpMethod = 'POST';
                const credentials = { api_key: config.api_key };

                ApiClient.callApi(queryPath, httpMethod, formParams, credentials).then((resp) => {
                        expect(resp.length).toEqual(2);
                        expect(resp[0].url).toEqual(ApiClientFixtures.dummyPage2Response.rows[0][0]);
                        expect(resp[1].url).toEqual(ApiClientFixtures.dummyPage2Response.rows[1][0]);
                        done();
                }, (err) => {
                    done(err);
                });
            });
        });
    });
});
