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
