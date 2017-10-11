/* a starting point ... 

mydigitalstructure.data.settings - as loaded from settings.json
mydigitalstructure.data.session - [init] mydigitalstructure session details - status: OK = Authenticated

*/

process.env.DEBUG = true;

var _ = require('lodash')
var mydigitalstructure = require('mydigitalstructure')
var app = {_util: {}, data: {}}

mydigitalstructure.init(main)

function main(err, data)
{
	//console.log('status:' + mydigitalstructure.data.session.status);
	//console.log('myds:' + JSON.stringify(mydigitalstructure.data.settings))

	if (mydigitalstructure.data.session.status = "OK")
	{
		app.init()
	}	
}

app.init = function ()
{
	app.data.yodlee = {settings: mydigitalstructure.data._settings.yodlee};

	if (process.env.DEBUG) {console.log('app.data.yodlee.settings:' + JSON.stringify(app.data.yodlee.settings))};

	app._util.yodlee.init(app.logon)
}

app.logon = function ()
{
	if (process.env.DEBUG) {console.log('app.data.yodlee.session:' + JSON.stringify(app.data.yodlee.session))};
	app._util.yodlee.logon(app.start)
}

app.start = function ()
{
	if (process.env.DEBUG) {console.log('app.data.yodlee.user:' + JSON.stringify(app.data.yodlee.user))};
	if (process.env.DEBUG) {console.log('---')};
	if (process.env.DEBUG) {console.log('app.data.yodlee.session:' + JSON.stringify(app.data.yodlee.session))};

	var options =
	{
		endpoint: 'accounts',
		query: 'container=bank'
	};

	app._util.yodlee.send(options, app._util.show.accounts)
}

app._util.show = 
{
	accounts: function (options)
	{
		var showData;
		var showHeader =
		[
			{caption: 'Provider', param: 'providerName'},
			{caption: 'Provider-ID', param: 'providerAccountId'},
			{caption: 'Account-ID', param: 'id'},
			{caption: 'Account-Type', param: 'CONTAINER'},
			{caption: 'Account-Name', param: 'accountName'},
			{caption: 'Account-Number', param: 'accountNumber'},
			{caption: 'Account-Balance', parentParam: 'balance', param: 'amount'},
			{caption: 'Account-Balance-As-At', parentParam: 'refreshinfo', param: 'lastRefreshed'}
		];

		if (process.env.DEBUG) {console.log('---')};
		if (process.env.DEBUG) {console.log('app._util.show.accounts:' + JSON.stringify(options.data))};

		console.log(_.join(_.map(showHeader, 'caption'), ', '));

		_.each(options.data.account, function (data, d)
		{
			showData = [];
			
			_.each(showHeader, function (header)
			{
				if (_.isUndefined(header.parentParam))
				{
					showData.push(data[header.param])
				}
				else
				{
					if (_.isUndefined(data[header.parentParam]))
					{
						showData.push('-')
					}
					else
					{
						showData.push(data[header.parentParam][header.param])
					}	
				}
			});

			console.log(_.join(showData, ', '));
		})	
	}
}	

app._util.yodlee =
{
	init: function (callBack)
			{
				var https = require('https');
				
				var requestData =
				{
					cobrand:
					{
						cobrandLogin: app.data.yodlee.settings.cobrand.logon,
						cobrandPassword: app.data.yodlee.settings.cobrand.password,
						locale: 'en_US'
					}
				}

				var _requestData = JSON.stringify(requestData)

				var requestOptions =
				{
					hostname: app.data.yodlee.settings.hostname,
					port: 443,
					path: '/ysl/restserver/v1/cobrand/login',
					method: 'POST',
					headers:
					{
						'Content-Type': 'application/json',
						"Content-Length": Buffer.byteLength(_requestData)
					}
				};

				var req = https.request(requestOptions, function(res)
				{
					res.setEncoding('utf8');

					var data = '';
					
					res.on('data', function(chunk)
					{
					  	data += chunk;
					});
					
					res.on('end', function ()
					{	
						if (process.env.DEBUG) {console.log('#app.init.res.end.response:' + data)}
						app.data.yodlee.session = JSON.parse(data);
						app.data.yodlee.session.cobSession = app.data.yodlee.session.session.cobSession;
				    	if (_.isFunction(callBack)) {callBack({data: app.data.yodlee.session})};
					});
				});

				req.on('error', function(error)
				{
					if (process.env.DEBUG) {console.log('#app.init.req.error.response:' + error.message)}
				  	if (callBack) {callBack({error: error})};
				});

				req.end(_requestData)
			},

	logon: function (callBack)
			{
				var https = require('https');
				
				var requestData =
				{
					user:
					{
						loginName: app.data.yodlee.settings.user.logon,
						password: app.data.yodlee.settings.user.password,
						locale: 'en_US'
					}
				}

				var _requestData = JSON.stringify(requestData)

				var requestOptions =
				{
					hostname: app.data.yodlee.settings.hostname,
					port: 443,
					path: '/ysl/restserver/v1/user/login',
					method: 'POST',
					headers:
					{
						'Content-Type': 'application/json',
						'Content-Length': Buffer.byteLength(_requestData),
						'Authorization': 'cobSession=' + app.data.yodlee.session.cobSession
					}
				};

				var req = https.request(requestOptions, function(res)
				{
					res.setEncoding('utf8');

					var data = '';
					
					res.on('data', function(chunk)
					{
					  	data += chunk;
					});
					
					res.on('end', function ()
					{	
						if (process.env.DEBUG) {console.log('#app.logon.res.end.response:' + data)}
						app.data.yodlee.user = JSON.parse(data).user;
						app.data.yodlee.session.userSession = app.data.yodlee.user.session.userSession;

				    	if (_.isFunction(callBack)) {callBack({data: app.data.yodlee.user})};
					});
				});

				req.on('error', function(error)
				{
					if (process.env.DEBUG) {console.log('#app.logon.req.error.response:' + error.message)}
				  	if (callBack) {callBack({error: error})};
				});

				req.end(_requestData)
			},

	send: function (options, callBack)
			{
				var https = require('https');
				
				if (_.isUndefined(options.method)) {options.method = 'GET'};

				var requestOptions =
				{
					hostname: app.data.yodlee.settings.hostname,
					port: 443,
					path: '/ysl/restserver/v1/' + options.endpoint + (options.query!=undefined?'/?' + options.query:''),
					method: options.method,
					headers:
					{
						'Authorization': 'cobSession=' + app.data.yodlee.session.cobSession + ', userSession=' + app.data.yodlee.session.userSession
					}
				};

				var req = https.request(requestOptions, function(res)
				{
					res.setEncoding('utf8');

					var data = '';
					
					res.on('data', function(chunk)
					{
					  	data += chunk;
					});
					
					res.on('end', function ()
					{	
						if (process.env.DEBUG) {console.log('---'); console.log('#app.send.res.end.response:' + data)}
						dataResponse = JSON.parse(data);

				    	if (_.isFunction(callBack)) {callBack({data: dataResponse})};
					});
				});

				req.on('error', function(error)
				{
					if (process.env.DEBUG) {console.log('#app.send.req.error.response:' + error.message)}
				  	if (callBack) {callBack({error: error})};
				});

				//req.write(_requestData)
				req.end()
			}				
}					