/* a starting point ... */

var mydigitalstructure = require('mydigitalstructure')
var _ = require('lodash')

mydigitalstructure.init(main)

function main(err, data)
{
	console.log('status:' + mydigitalstructure.data.session.status)

	if (mydigitalstructure.data.session.status = "OK")
	{
		
	}	
}