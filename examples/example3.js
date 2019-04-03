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


const Mixnode = require('./../src/index');
const config = require('./config.js');

/* Get 10 higher education market websites that uses wordpress */
const query = "SELECT ?? from ??  where ?? like '%name=\"generator\" content=\"WordPress%'"
			+ "and ?? = 'edu' LIMIT 10";

const vars = ['url_host', 'homepages', 'content', 'url_etld'];

const SQLClient = new Mixnode.SQLClient(config);

SQLClient.execute(query, vars, 1073741829 * 20, { timeout: 100000 }).then((response) => {
	console.log(response);
}).catch((err) => {
	console.log(err);
});
