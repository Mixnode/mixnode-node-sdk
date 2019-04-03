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

Mixnode.setDebug(true);
const SQLClient = new Mixnode.SQLClient(config);
SQLClient.execute('SELECT ?? from ?? where ?? like ? LIMIT 10',
	[['url_host'], 'homepages', 'content', '%<meta name="generator" content="MediaWiki%'],
	1073741824 * 20000)
.then((response) => {
	console.log(response);
}).catch((err) => {
	console.log(err);
});
