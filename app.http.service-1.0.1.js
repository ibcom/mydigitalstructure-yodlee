/*
https://github.com/coreybutler/node-windows

The recommended way to install node-windows is with npm, using the global flag:
npm install -g node-windows

Then, in your project root, run:
npm link node-windows
*/

var Service = require('node-windows').Service;

var service = new Service(
{
	name: 'mydigitalstructure / Yodlee Proxy (1.0.1)',
	description: 'Nodejs based mydigitalstructure/Yodlee proxy.',
	script: 'C:\\lab\\mydigitalstructure-yodlee\\app.http-1.0.1.js'
});

/*
service.on('install',function()
{
	service.start();
});
*/

service.install();