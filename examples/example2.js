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

// set debugging to true logs the state of the application.
// Do not use it in production.
Mixnode.setDebug(true);

//* ********* Arguments section *******************************/
// sample query to get the data from Mixnode
const columns = ['url', 'url_domain'];
const query = 'SELECT ?? from ?? where ?? = ? LIMIT 10';

// vars is the list of options to replace in the query
const vars = [columns, 'homepages', 'url_domain', 'wikipedia.com'];

/** ********************************************************** */

// Create an instance of the SQL Api
const SQLClient = new Mixnode.SQLClient({
    api_key: 'XXXXXX' // add your API KEY here available at https://www.mixnode.com/account/api
});


// Note: This example will fail until api_key is provided above
const runSQLQueries = function (query, vars) {
	console.log('***** Running SQL on Mixnode *****');
	return SQLClient.execute(query, vars);
};

runSQLQueries(query, vars).then((response) => {
	console.log(response);
}).catch((err) => {
	console.log(err);
});
