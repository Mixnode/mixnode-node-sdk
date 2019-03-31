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
