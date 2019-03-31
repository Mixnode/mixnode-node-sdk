const Mixnode = require('./../src/index');
const config = require('./config.js');

/* Get 10 higher education market websites that uses wordpress*/
const query = "SELECT ?? from ??  where ?? like '%name=\"generator\" content=\"WordPress%'"
			+ "and ?? = 'edu' LIMIT 10"

const vars = ['url_host', 'homepages', 'content', 'url_etld'];

const SQLClient = new Mixnode.SQLClient(config);

SQLClient.execute(query, vars, 1073741829 * 20, { timeout: 10000 }).then((response) => {
	console.log(response);
}).catch((err) => {
	console.log(err);
});
