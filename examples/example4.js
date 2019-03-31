const Mixnode = require('./../src/index');
const config = require('./config.js');


/*Get WordPress websites that contain keywords such as 'bitcoin' and 'ethereum'*/
const query = "select url_host from ?? where " 
     + "content like '%name=\"generator\" content=\"WordPress%'"
     + "and content like '%bitcoin%' and content like '%ethereum%' LIMIT 10"

const SQLClient = new Mixnode.SQLClient(config);
SQLClient.execute(query, ['homepages'])
.then((response) => {
	console.log(response);
}).catch((err) => {
	console.log(err);
});
