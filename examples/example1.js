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
// set debugging to true logs the state of the application.
// Do not use it in production.
// Mixnode.setDebug(true);


//* ********* Arguments section *******************************/
// sample query to get the data from Mixnode
const query = 'SELECT url from homepages LIMIT 10';
// vars is the list of options to replace in the query
const vars = [];
/** ********************************************************** */

const runSQLQueries = function (query, oOptions) {
	// Create an instance of the SQL Client
	const SQLClient = new Mixnode.SQLClient(config);
	console.log('***** Running SQL on Mixnode *****');
	return SQLClient.execute(query, oOptions);
};

runSQLQueries(query, 10737418242323).then((response) => {
	console.log(response);
}).catch((err) => {
	console.log(err);
});
