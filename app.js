/* 
mydigitalstructure <> Yodlee Connector
Designed to run on node and AWS lambda
See: http://docs.mydigitalstructure.com/gettingstarted_nodejs
Use: https://www.npmjs.com/package/aws-lambda-local
$ lambda-local -f app.js -c settings-private.json -e event.json
*/

exports.handler = function (event, context)
{
	//context = settings

	var _ = require('lodash');
	var moment = require('moment');
	var mydigitalstructure = require('mydigitalstructure');

	var app = {_util: {}, data: {source: {}, destination: {}, event: event}}

	mydigitalstructure.init(main, context)

	mydigitalstructure._util.testing.data(event, 'event');

	function main(err, data)
	{
		if (mydigitalstructure.data.session.status == "OK")
		{
			app.init()
		}	
	}

	app.init = function ()
	{
		if (_.isObject(app.data.event.user))
		{
			mydigitalstructure.data._settings.yodlee.user = app.data.event.user
		}

		var defaultPassword = mydigitalstructure.data._settings.yodlee.defaults.password;

		mydigitalstructure.data._settings.yodlee.user.password = defaultPassword;

		app.data.yodlee = {settings: mydigitalstructure.data._settings.yodlee};
		mydigitalstructure._util.testing.data(app.data.yodlee.settings, 'app.init-app.data.yodlee.settings');

		app._util.yodlee.init(app.logon);
	}

	app.logon = function ()
	{
		mydigitalstructure._util.testing.data(app.data.yodlee.settings, 'app.logon-app.data.yodlee.settings');
		
		if (app.data.yodlee.settings.user.logon != '')
		{
			app._util.yodlee.logon(app.start);
		}
		else
		{
			app.start();
		}
	}

	app.start = function ()
	{
		mydigitalstructure._util.testing.data(app.data.yodlee.user, 'app.start##app.data.yodlee.user');
		mydigitalstructure._util.testing.data(app.data.yodlee.session, 'app.start##app.data.yodlee.session');
		mydigitalstructure._util.testing.data(app.data.event, 'app.start##app.data.event');

		if (app.data.event.method == 'sync')
		{
			app.prepare.source.accounts(app.data.event);
		}

		if (app.data.event.method == 'register/user')
		{
			app.register.user(app.data.event);
		}

		if (app.data.event.method == 'user/accessTokens')
		{
			app.user.accessTokens(app.data.event);
		}

		if (app.data.event.method == 'user/accounts')
		{
			app.user.accounts(app.data.event);
		}
	}

	app.register =
	{
		user: function (options, response)
		{
			if (_.isUndefined(response))
			{
				mydigitalstructure._util.testing.data(mydigitalstructure.data.session, 'app.register##mydigitalstructure.data.session');

				var session = mydigitalstructure.data.session;

				var sendOptions =
				{
					endpoint: options.method,
					data: options.param,
					action: options.action
				};

				app._util.yodlee.send(sendOptions, app.register.user)
			}
			else
			{
				app.data.register = response.data.user;
				mydigitalstructure._util.testing.data(response, 'app.register.user::app.data.register');
			}
		}
	}

	app.user =
	{
		accessTokens: function (options, response)
		{
			if (_.isUndefined(response))
			{
				var sendOptions =
				{
					endpoint: options.method,
					query: 'appIds=10003600',
					action: options.action
				};

				app._util.yodlee.send(sendOptions, app.user.accessTokens)
			}
			else
			{
				mydigitalstructure._util.testing.data(response, '_response')
				app.data.accessTokens = response.data.user.accessTokens;
				mydigitalstructure._util.testing.data(app.data.accessTokens, 'app.user.accessTokens::app.data.accessTokens');

				var data = 
				'<form action="https://quickstartaunode.yodlee.com.au/authenticate/quickstarta3/?channelAppName=quickstartau" method="POST">' +
				'<input type="text" name="app" value="10003600" />' +
				'<input type="text" name="rsession" value="' + app.data.yodlee.session.userSession + '"/>' +
				'<input type="text" name="token" value="' + app.data.accessTokens[0].value + '"/>' +
				'<input type="text" name="redirectReq" value="true"/>' +
				'<input type="submit" name="submit" />' +
				'</form>';

				var command =
				'ns1blankspace.util.financial.bankAccounts.link.show({}, {' +
				'userSession: "' + app.data.yodlee.session.userSession + '",' +
				'appToken: "' + app.data.accessTokens[0].value + '"})'

				mydigitalstructure._util.testing.data(data);
				mydigitalstructure._util.testing.data(app.data.yodlee.session.userSession, 'rsession');
				mydigitalstructure._util.testing.data(app.data.accessTokens[0].value, 'token');
				mydigitalstructure._util.testing.data(command);

				var fs = require('fs'); fs.writeFile("yodlee.txt", command, function (err) {})
			}
		},

		accounts: function (options, response)
		{
			if (_.isUndefined(response))
			{
				var sendOptions =
				{
					endpoint: 'accounts',
					query: 'container=bank'
				};

				app._util.yodlee.send(sendOptions, app.user.accounts)
			}
			else
			{
				mydigitalstructure._util.testing.data(response.data.account, 'app.user.accounts::response.data.account');

				app._util.show.accounts({accounts: response.data.account});
			}
		},

		transactions: function (options, response)
		{
			//https://developer.yodlee.com/apidocs/index.php#!/transactions/getTransactions
			//https://developer.api.yodlee.com:443/ysl/restserver/v1/transactions?accountId=10916521&fromDate=2000-01-01

			if (_.isUndefined(response))
			{
				if (_.isUndefined(options.fromDate)) {options.fromDate = '2000-01-01'}

				var sendOptions =
				{
					endpoint: 'transactions',
					query: 'accountId=' + options.accountIDs + '&fromDate=' + options.fromDate
				};

				mydigitalstructure._util.testing.data(sendOptions, 'app.prepare.source.transactions::options');

				app._util.yodlee.send(sendOptions, app.prepare.source.transactions)
			}
			else
			{
				app.data.source.transactions = response.data.transaction;
				mydigitalstructure._util.testing.data(app.data.source.transactions, 'app.prepare.source.transactions::app.data.source.transactions');

				if (mydigitalstructure._util.testing.status())
				{	
					app._util.show.transactions();
				}	

				app.process.destination.sources();
			}
		}	
	}

	app.prepare =
	{
		source:
		{
			accounts: function (options, response)
			{
				if (_.isUndefined(response))
				{
					var sendOptions =
					{
						endpoint: 'accounts',
						query: 'container=bank'
					};

					app._util.yodlee.send(sendOptions, app.prepare.source.accounts)
				}
				else
				{
					app.data.source.accounts = response.data.account;
					mydigitalstructure._util.testing.data(app.data.source.accounts, 'app.prepare.source.accounts::app.data.source.accounts');

					app._util.show.accounts();
					app.prepare.destination.accounts();
				}
			},

			transactions: function (options, response)
			{
				//https://developer.yodlee.com/apidocs/index.php#!/transactions/getTransactions
				//https://developer.api.yodlee.com:443/ysl/restserver/v1/transactions?accountId=10916521&fromDate=2000-01-01

				if (_.isUndefined(response))
				{
					if (_.isUndefined(options.fromDate)) {options.fromDate = '2000-01-01'}

					var sendOptions =
					{
						endpoint: 'transactions',
						query: 'accountId=' + options.accountIDs + '&fromDate=' + options.fromDate
					};

					mydigitalstructure._util.testing.data(sendOptions, 'app.prepare.source.transactions::options');

					app._util.yodlee.send(sendOptions, app.prepare.source.transactions)
				}
				else
				{
					app.data.source.transactions = response.data.transaction;
					mydigitalstructure._util.testing.data(app.data.source.transactions, 'app.prepare.source.transactions::app.data.source.transactions');

					if (mydigitalstructure._util.testing.status())
					{	
						app._util.show.transactions();
					}	

					app.process.destination.sources();
				}
			}	
		},

		destination:
		{
			accounts: function (options, response)
			{
				if (_.isUndefined(response))
				{
					mydigitalstructure.send(
					{
						url: '/rpc/financial/?method=FINANCIAL_BANK_ACCOUNT_SEARCH&advanced=1'
					},
					'criteria={"fields":[{"name":"title"},{"name":"bsb"},{"name":"accountnumber"},{"name":"accountname"}],"options":{"rows":50}}',
					app.prepare.destination.accounts);
				}
				else
				{
					app.data.destination.accounts = JSON.parse(response).data.rows;

					mydigitalstructure._util.testing.data(app.data.destination.accounts, 'app.prepare.destination.accounts::app.data.destination.accounts');

					app.process.source.accounts.init()
				}
			},

			sources: function (options, response)
			{
				if (_.isUndefined(response))
				{
					var criteria = mydigitalstructure._util.search.init();
					criteria.fields.push({"name":"bankaccount"},{"name":"bankaccounttext"},{"name":"enddate"},{"name":"startdate"})
					criteria.options.rows = 1
					criteria.filters.push({"name":"bankaccount", "comparison":"EQUAL_TO", "value1": options.bankAccountID});
					criteria.sorts.push({"name":"id", "direction":"desc"})

					mydigitalstructure.send(
					{
						url: '/rpc/financial/?method=FINANCIAL_BANK_ACCOUNT_TRANSACTION_SOURCE_SEARCH&advanced=1',
						bankAccountID: options.bankAccountID
					},
					'criteria=' + JSON.stringify(criteria),
					app.prepare.destination.sources);
				}
				else
				{
					app.data.destination.sources = JSON.parse(response).data.rows;

					mydigitalstructure._util.testing.data(app.data.destination.sources, 'app.prepare.destination.sources::app.data.destination.sources');

					var reducedAccount = _.find(app.data.source.reducedAccounts, function (account) {return account.destinationAccountID == options.bankAccountID})

					var options =
					{
						fromDate: '2000-01-01',
						accountIDs: reducedAccount.id
					}

					if (_.size(app.data.destination.sources) != 0)
					{
						if (moment(_.first(app.data.destination.sources).enddate, 'DD MMM YYYY').isValid())
						{
							options.fromDate = moment(_.first(app.data.destination.sources).enddate, 'DD MMM YYYY').format('YYYY-MM-DD');
						}
					}
					
					app.prepare.source.transactions(options)
				}
			},
				
			transactions: function (options, response)
			{
				if (_.isUndefined(response))
				{
					var criteria = mydigitalstructure._util.search.init();
					criteria.fields.push({"name":"externalid"},{"name":"amount"},{"name":"posteddate"})
					criteria.options.rows = 1000;
					criteria.filters.push({"name":"posteddate", "comparison":"GREATER_THAN_OR_EQUAL_TO", "value1": app.process.data.transactionMin.transactionDate});
					criteria.filters.push({"name":"bankaccount", "comparison":"EQUAL_TO", "value1": app.process.data.processSourceAccount.destinationAccountID});
					criteria.sorts.push({"name":"id", "direction":"desc"})

					mydigitalstructure.send(
					{
						url: '/rpc/financial/?method=FINANCIAL_BANK_ACCOUNT_TRANSACTION_SEARCH&advanced=1'
					},
					'criteria=' + JSON.stringify(criteria),
					app.prepare.destination.transactions);
				}
				else
				{
					app.data.destination.transactions = JSON.parse(response).data.rows;

					if (JSON.parse(response).morerows == "true") 
					{
						mydigitalstructure._util.testing.message('!Warning:Too many transactions.', 'app.prepare.destination.transactions');
						//send email based on settings
					}
					else
					{
						mydigitalstructure._util.testing.data(app.data.destination.transactions, 'app.prepare.destination.transactions::app.data.destination.transactions');
						app.process.destination.transactions.init();
					}
				}
			}
		}		
	}

	app.process =
	{
		data: {},

		source:
		{
			accounts: 
			{
				init: function ()
				{
					var destinationAccounts = app.data.destination.accounts; //mydigitalstructure
					var sourceAccounts = app.data.source.accounts; //Yodlee

					_.each(sourceAccounts, function (sourceAccount)
					{
						sourceAccount.processed = false;

						sourceAccount.destinationAccount = _.find(destinationAccounts, function(destinationAccount)
						{
							return sourceAccount.accountName == destinationAccount.accountname
						});

						if (_.isObject(sourceAccount.destinationAccount)) {sourceAccount.destinationAccountID = sourceAccount.destinationAccount.id} 
					});

					var reducedSourceAccounts = _.filter(sourceAccounts, function (sourceAccount)
					{
						return (sourceAccount.destinationAccountID != undefined)
					});

					app.data.source.reducedAccounts = reducedSourceAccounts;

					mydigitalstructure._util.testing.data(app.data.source.reducedAccounts, 'app.process.source.accounts::reducedAccounts');

					if (mydigitalstructure._util.testing.status())
					{
						app._util.show.accounts({accounts: reducedSourceAccounts});
					}	

					app.process.source.accounts.sync()
				},
				
				sync: function ()
				{
					if (_.isUndefined(_.find(app.data.source.reducedAccounts, function (account) {return !account.processed})))
					{
						mydigitalstructure._util.testing.message('ALL DONE!!', 'app.process.source.accounts.sync');
					}
					else
					{
						app.process.data.processSourceAccount = _.find(app.data.source.reducedAccounts, function (account) {return !account.processed});
						app.prepare.destination.sources({bankAccountID: app.process.data.processSourceAccount.destinationAccountID});
					}
				}	
			}
		},

		destination:
		{
			sources: function (options, response)
			{
				//Create a new source record if their are new transactions
				//app.data.destination.sources

				if (_.isUndefined(response))
				{
					//get min/max dates from app.data.source.transactions
					app.process.data.transactionMax = _.maxBy(app.data.source.transactions, function(transaction) {return moment(transaction.transactionDate, 'YYYY-MM-DD')});
					app.process.data.transactionMin = _.minBy(app.data.source.transactions, function(transaction) {return moment(transaction.transactionDate, 'YYYY-MM-DD')});

					var data = 'bankaccount=' + app.process.data.processSourceAccount.destinationAccountID +
								'&startdate=' + moment(app.process.data.transactionMin.transactionDate, 'YYYY-MM-DD').format('DD MMM YYYY') +
								'&enddate=' + moment(app.process.data.transactionMax.transactionDate, 'YYYY-MM-DD').format('DD MMM YYYY') +
								'&processeddate=' + moment().format('DD MMM YYYY')

					if (_.size(app.data.source.transactions) != 0)
					{
						mydigitalstructure.send(
						{
							url: '/rpc/financial/?method=FINANCIAL_BANK_ACCOUNT_TRANSACTION_SOURCE_MANAGE'
						},
						data,
						app.process.destination.sources);
					}	
				}
				else
				{
					app.data.destination.processSourceID = JSON.parse(response).id;

					mydigitalstructure._util.testing.data(app.data.destination.processSourceID, 'app.process.destination.sources::sourceid');

					app.prepare.destination.transactions()
				}
			},

			transactions: 
			{
				init: function (options, response)
						{
							//Go through transactions and add to destination

							app.process.data.destinationTransactions = [];

							_.each(app.data.source.transactions, function (sourceTransaction)
							{
								sourceTransaction.processed = _.isObject(_.find(app.data.destination.transactions, function (destinationTransaction)
								{
									return sourceTransaction.id == destinationTransaction.externalid
								}));

							});

							app.process.destination.transactions.send();
						},

				send: function (options, response)
						{
							app.data.source.processTransaction = _.find(app.data.source.transactions, function (transaction) {return !transaction.processed})

							if (_.isObject(app.data.source.processTransaction))
							{
								var transaction = app.data.source.processTransaction;

								var data =
								{
									source: app.process.data.destinationSourceID,
									externalid: transaction.id,
									amount: transaction.amount.amount,
									posteddate: moment(transaction.transactionDate, 'YYYY-MM-DD').format('DD MMM YYYY'),
									bankaccount: app.process.data.processSourceAccount.destinationAccountID,
									source: app.data.destination.processSourceID,
									notes: transaction.description.original
								}

								mydigitalstructure.send(
								{
									url: '/rpc/financial/?method=FINANCIAL_BANK_ACCOUNT_TRANSACTION_MANAGE'
								},
								data,
								app.process.destination.transactions.finalise);
							}
							else
							{
								var data =
								{
									id: app.data.destination.processSourceID,
									remove: 1
								}

								if (_.size(app.process.data.destinationTransactions) == 0)
								{
									mydigitalstructure.send(
									{
										url: '/rpc/financial/?method=FINANCIAL_BANK_ACCOUNT_TRANSACTION_SOURCE_MANAGE'
									},
									data,
									app.process.destination.transactions.done);
								}
								else
								{
									app.process.destination.transactions.done();
								}
							}	
						},

				finalise: function (options, response)
						{
							app.process.data.destinationTransactions.push(JSON.parse(response).id);

							var sourceTransaction = _.find(app.data.source.transactions, function (transaction) {return transaction.id == app.data.source.processTransaction.id})
							sourceTransaction.processed = true;
							app.process.destination.transactions.send();
						},

				done: function ()
				{
					var sourceAccount = _.find(app.data.source.reducedAccounts, function (account) {return account.id == app.process.data.processSourceAccount.id})
					sourceAccount.processed = true;

					mydigitalstructure._util.testing.message(sourceAccount.accountName + ' / ' + _.size(app.process.data.destinationTransactions) + ' transaction(s)', 'app.process.destination.transactions::!DONE');

					app.process.source.accounts.sync();
				}		
			}
		}
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

			console.log(_.join(_.map(showHeader, 'caption'), ', '));

			if (!_.isUndefined(options))
			{
				if (!_.isUndefined(options.accounts)) {accounts = options.accounts}
			}

			_.each(accounts, function (data)
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

			});
		},

		transactions: function (options)
		{
			var showData;
			var showHeader =
			[
				{caption: 'Account-ID', param: 'accountId'},
				{caption: 'Account-Running-Balance', parentParam: 'runningBalance', param: 'amount'},
				{caption: 'Tran-ID', param: 'id'},
				{caption: 'Tran-Date', param: 'transactionDate'},
				{caption: 'Tran-Status', param: 'status'},
				{caption: 'Tran-Cheque-Number', param: 'checkNumber'},
				{caption: 'Tran-Amount', parentParam: 'amount', param: 'amount'},
				{caption: 'Tran-Description', parentParam: 'description', param: 'original'},
				{caption: 'Tran-Description-Simple', parentParam: 'description', param: 'simple'},
				{caption: 'Tran-Created-At-Source-Date', param: 'createdDate'}
			];

			console.log(_.join(_.map(showHeader, 'caption'), ', '));

			_.each(app.data.source.transactions, function (data)
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

			});
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
						path: app.data.yodlee.settings.basepath + '/cobrand/login',
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
							app.data.yodlee.session = JSON.parse(data);
							app.data.yodlee.session.cobSession = app.data.yodlee.session.session.cobSession;
					    	if (_.isFunction(callBack)) {callBack({data: app.data.yodlee.session})};
						});
					});

					req.on('error', function(error)
					{
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
						path: app.data.yodlee.settings.basepath + '/user/login',
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
							app.data.yodlee.user = JSON.parse(data).user;
							app.data.yodlee.session.userSession = app.data.yodlee.user.session.userSession;

					    	if (_.isFunction(callBack)) {callBack({data: app.data.yodlee.user})};
						});
					});

					req.on('error', function(error)
					{
					  	if (callBack) {callBack({error: error})};
					});

					req.end(_requestData)
				},

		send: function (options, callBack)
				{
					var https = require('https');
					
					if (_.isUndefined(options.action)) {options.action = 'GET'};

					var userSession = '';

					if (app.data.yodlee.session.userSession != undefined)
					{
						userSession = ', userSession=' + app.data.yodlee.session.userSession
					}

					var headers =
					{
						'Authorization': 'cobSession=' + app.data.yodlee.session.cobSession + userSession
					}

					var _requestData;

					if (_.isObject(options.data))
					{
						_requestData = JSON.stringify(options.data);

						headers['Content-Type'] = 'application/json';
						headers['Content-Length'] = Buffer.byteLength(_requestData);
					}

					var requestOptions =
					{
						hostname: app.data.yodlee.settings.hostname,
						port: 443,
						path: app.data.yodlee.settings.basepath + '/' + options.endpoint + (options.query!=undefined?'/?' + options.query:''),
						method: options.action,
						headers: headers
					};

					mydigitalstructure._util.testing.data(requestOptions, 'send-requestOptions');
					mydigitalstructure._util.testing.data(_requestData, 'send-requestData');

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
							dataResponse = JSON.parse(data);
					    	if (_.isFunction(callBack)) {callBack(options, {data: dataResponse})};
						});
					});

					req.on('error', function(error)
					{
					  	if (callBack) {callBack({error: error})};
					});

					req.end(_requestData)
				}				
	}
}					