var moment = require("moment")
var Consumer = require("../consumers/consumer.js")
var Factory = require("../factories/item_factory.js")
var config = require("../config.js")
var utils = require("../lib/utils.js")
var colors = require("colors/safe")
var histogram = require('ascii-histogram')
var bytes = require('bytes')
var defaultsDeep = require('lodash.defaultsdeep')

var defaultConfig = {
	tester: {
		ips: 10,
		keys: 10,
		rate: 1000
	},
	consumer: {
		window: {
			max: {
				"seconds": 5,
				"minutes": 10,
				"hours": 24
			},
			clearAt: 2
		},
		features: {
			unique: false,
			count: true,
			sliding: true
		}
	},
	producer: {
		batchmax: 10,
		batchrate: 1000
	}
}

config = defaultsDeep(config,defaultConfig)

var consumer = Consumer(config.consumer)
var factory = Factory(config.factory)

setInterval(function(){
	var batchsize = utils.getRandomInt(1,config.producer.batchmax)
	var timestamp = moment().unix();
	for (var i=0;i<batchsize; i++){
		var randomLinkKey = config.tester.keys > 1 ? utils.getRandomInt(1, config.tester.keys) : null
		var randomIp = config.tester.ips > 1 ? utils.getRandomInt(1, config.tester.ips) : 1
		var wlog = factory.create(randomLinkKey, randomIp, timestamp)
		consumer.consume(wlog)
	}	
}, config.producer.batchrate)


var start = moment().unix()*1000
setInterval(function(){
	var now = moment().unix()*1000
	console.log('\033[2J');
	console.log("Elapsed:\t%s", moment.duration(now - start).humanize())
	var usage = process.memoryUsage()
	console.log("Memory:\t%s/%s (%s%)", bytes(usage.heapUsed), bytes(usage.heapTotal), Math.floor((usage.heapUsed/usage.heapTotal)*100))
	console.log("Cleans:\t%s", consumer.cleans())
	console.log()
	var hourwindow = { units: 3, type: 'hours'}
	console.log(colors.green("Total hits last %s %s:%s"), hourwindow.units, hourwindow.type, consumer.total(null, hourwindow))
	console.log();
	console.log(histogram(consumer.histogram(null, hourwindow), { bar: '=', width: 20, sort: false }));
	var minwindow = { units: 5, type: 'minutes'}
	console.log(colors.green("Total hits last %s %s: %s"), minwindow.units, minwindow.type, consumer.total(null, minwindow))
	console.log();
	console.log(histogram(consumer.histogram(null, minwindow), { bar: '=', width: 20, sort: false }));
	var secwindow = { units: 15, type: 'seconds'}
	console.log(colors.green("Total hits last %s %s: %s"), secwindow.units, secwindow.type, consumer.total(null, secwindow))
	console.log();
	console.log(histogram(consumer.histogram(null, secwindow), { bar: '=', width: 20, sort: false }));
}, config.tester.rate)
