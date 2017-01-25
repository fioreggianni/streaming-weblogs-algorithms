var moment = require("moment")
var Consumer = require("../mincount-consumer.js")
var Factory = require("../item_factory.js")
var config = require("../config.js")
var colors = require("colors/safe")
var utils = require("../lib/utils.js")
var histogram = require('ascii-histogram');
var bytes = require('bytes')
  
var consumer = Consumer(config.consumer)
var factory = Factory(config.factory)

setInterval(function(){
	var timestamp = moment().unix();
	var randomLinkKey = config.tester.keys > 1 ? utils.getRandomInt(1, config.tester.keys) : 1
	var randomIp = config.tester.ips > 1 ? utils.getRandomInt(1, config.tester.ips) : 1
	var wlog = factory.create(randomLinkKey, randomIp, timestamp)
	consumer.consume(wlog)
}, config.producer.batchrate)


var start = moment().unix()*1000
setInterval(function(){
	var now = moment().unix()*1000
//	console.log('\033[2J');
	console.log("Elapsed:\t%s", moment.duration(now - start).humanize())
	var usage = process.memoryUsage()
	console.log("Memory:\t%s/%s (%s%)", bytes(usage.heapUsed), bytes(usage.heapTotal), Math.floor((usage.heapUsed/usage.heapTotal)*100))
	console.log()
	console.log(consumer.tops())
	console.log()
}, config.tester.rate)
