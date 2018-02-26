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
	name: 'mydigitalstructure / Yodlee Proxy',
	script: 'C:\\lab\\mydigitalstructure-yodlee\\app-http-service.js'
});

/*
service.on('uninstall',function()
{
});
*/

service.uninstall();