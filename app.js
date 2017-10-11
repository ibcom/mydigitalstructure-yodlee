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

	app._util.yodlee.init(app.start)
}

app.start = function ()
{
	if (process.env.DEBUG) {console.log('app.data.yodlee.session:' + JSON.stringify(app.data.yodlee.session))};
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
						if (process.env.DEBUG) {console.log('#myds.send.res.end.response:' + data)}
						app.data.yodlee.session = JSON.parse(data);
						app.data.yodlee.session.cobSessionToken = app.data.yodlee.session.session.cobSessionToken;
				    	if (_.isFunction(callBack)) {callBack({data: app.data.yodlee.session})};
					});
				});

				req.on('error', function(error)
				{
					if (process.env.DEBUG) {console.log('#myds.logon.req.error.response:' + error.message)}
				  	if (callBack) {callBack({error: error})};
				});

				req.end(_requestData)
			},

	logon: function (callBack)
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

				 "user":      {
      "loginName": "sbMemdev.biziio2",
      "password": "sbMemdev.biziio2#123",
      "locale": "en_US"
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
						'Content-Length': Buffer.byteLength(_requestData),
						'Authorization': 'cobSession=' + app.data.yodlee.session.cobSessionToken;

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
						if (process.env.DEBUG) {console.log('#myds.send.res.end.response:' + data)}
						app.data.yodlee.session = JSON.parse(data);

				    	if (_.isFunction(callBack)) {callBack({data: app.data.yodlee.session})};
					});
				});

				req.on('error', function(error)
				{
					if (process.env.DEBUG) {console.log('#myds.logon.req.error.response:' + error.message)}
				  	if (callBack) {callBack({error: error})};
				});

				req.end(_requestData)
			}		
}					