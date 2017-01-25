var moment = require("moment")
var Consumer = require("../consumer.js")
var Factory = require("../item_factory.js")
var ProgressBar = require('progress')
var config = require("../config.js")
var colors = require("colors/safe")
var utils = require("../lib/utils.js")

var consumer = Consumer(config.consumer)
var factory = Factory(config.factory)

var bar = new ProgressBar('Streaming '+config.tester.iterations+' weblogs :percent :bar', { 
	total: 10, 
	width: 20 
})
var tick = Math.floor(config.tester.iterations/10);

for (var i=0;i<config.tester.iterations; i++){
	var randomLinkKey = config.tester.keys > 1 ? utils.getRandomInt(1, config.tester.keys) : null
	var randomIp = config.tester.ips > 1 ? utils.getRandomInt(1, config.tester.ips) : 1
	var timestamp = i;
	var wlog = factory.create(randomLinkKey, randomIp, timestamp)
	consumer.consume(wlog)
	if (i % tick == 0) bar.tick()
}

var res = {
	uniques: consumer.uniques(),
	total: consumer.total(),
	real: config.tester.ips
}

console.log("Unique ips: %s/%s (real: %s)", res.uniques, res.total, res.real)
