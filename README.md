# Mixnode Node.js SDK 


## Overview
The Mixnode [Node.js](https://nodejs.org/) SDK allows you to easily integrate the Mixnode REST APIs into your Node.js application.

### Requirements
* Node.js version 4 and above.
* A Mixnode API key from a registered user on the [Mixnode portal](https://www.mixnode.com/account/api).


### Installation
```sh
npm install mixnode-node-sdk --save
```

## Tutorial
Follow this tutorial to see a step-by-step guide and examples of how to use the Mixnode Node.js SDK.

### Get the API key from Mixnode portal
* Create an account on [Mixnode](https://www.mixnode.com/signup).
* If already registered, then login and navigate to api key page. 
* Dashboard -> Choose API from left menu -> Note the API key. 
* Or, directly navigate to https://www.mixnode.com/account/api to find your API key.

### Authentication
This SDK comes with basic authentication over HTTPS which requires you to pass your Mixnode API key using a config file or as a json object during SQL client instantiation. 

#### Basic Authentication

This type of token is given directly to the application.

``` JavaScript
var Mixnode = require('mixnode-node-sdk');

// Create an instance of the Mixnode SQL Client
const SQLClient = new Mixnode.SQLClient({
    api_key: 'XXXXXX' // add your API KEY here; available at https://www.mixnode.com/account/api
});
```
Note that `api_key` can also be passed as a JSON object in a config file to avoid specifying the key in the code.
Please see [Examples](https://github.com/Mixnode/mixnode-node-sdk/blob/master/examples)

#### Quick Start

```JavaScript

const Mixnode = require('./../src/index');
const config = require('./config.js');

const SQLClient = new Mixnode.SQLClient(config);

// Gets 10 urls and their title from homepages table
SQLClient.execute('SELECT url, title from homepages LIMIT 10')
.then((response) => {
	console.log(response);
}).catch((err) => {
	console.log(err);
});

```

#### SQLClient's execute functionality
`SQLClient.execute` is an asynchronous operation which returns a `promise` object either resolving as a response or error which could then be obtained using `then` or `catch` statements. 

##### SQLClient.execute can accept upto four parameters : query, vars (optional), inputLimit (optional), timeout (optional). Please see various [Examples](https://github.com/Mixnode/mixnode-node-sdk/blob/master/examples) for usage details.
```JavaScript
SQLClient.execute(query).then((response) => {
	// Do somethere here with the response
}).catch((err) => {
	// Do something with the exception
});
```
```JavaScript
SQLClient.execute(query, vars).then((response) => {
	// Do somethere here with the response
}).catch((err) => {
	// Do something with the exception
});
```
```JavaScript
SQLClient.execute(query, vars, inputLimit).then((response) => {
	// Do somethere here with the response
}).catch((err) => {
	// Do something with the exception
});
```
```JavaScript
SQLClient.execute(query, vars, timeout).then((response) => {
	// Do somethere here with the response
}).catch((err) => {
	// Do something with the exception
});
```
```JavaScript
SQLClient.execute(query, vars, inputLimit, timeout).then((response) => {
	// Do somethere here with the response
}).catch((err) => {
	// Do something with the exception
});
```

#### SDK debugging
* Turning on the debug mode logs the HTTP requests being sent to the Mixnode API.
* This is useful to verify if the queries being sent are correct.
* This is useful to verify if the execution is in progress.

```JavaScript
/* Setting debug to true logs the state of the application.
Do not use this in production.
*/
Mixnode.setDebug(true);

```

#### SDK error explanation
```JavaScript
SQLClient.execute(query).then((response) => {
	// Do somethere here with the response
}).catch((error) => {
	// Do something with the exception
});
```
###### Error attributes
* `error.code` => Mixnode specified error code.
* `error.statusCode` => Http status code of the error.
* `error.message` => Message received from backend or due to exception caused in SDK code.
* `error.name` => SDK specified generic name of the error.
* `error.status` => Status of the query at the time of the error.
* `error.stack` => Stack trace of the error


## Examples: Mixnode SQL Client
[Examples](https://github.com/Mixnode/mixnode-node-sdk/tree/master/examples)

## SQL API Documentation

You can get the full documentation for the API on the [Mixnode SQL API reference](https://www.mixnode.com/docs/sql-api/introduction)


## Support

[hi@mixnode.com](mailto:hi@mixnode.com)
