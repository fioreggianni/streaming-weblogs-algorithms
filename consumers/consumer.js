var moment = require("moment")
var sha1 = require('sha1')
var utils = require("../lib/utils.js")
var lo = require('lodash/array')

module.exports = function(config){
	var cfg = config
	var state = {
		groups: {},
		totals: {},
		timebatches: {},
		now: moment(),
		seeds: [],
		total: 0,
		cleans: 0
	}
	var DEFAULT_GROUP = -1

	this.init = function(){
		for (var k=1;k<=cfg.instances;k++)
			state.seeds[k] = Math.random()*cfg.instances*10000
		this.initKey(DEFAULT_GROUP)
		return this
	}

	this.initKey = function(key){
		if (!state.groups[key]) {
			state.groups[key] = []
			if (cfg.features.count) state.totals[key] = 0
			if (cfg.features.sliding) state.timebatches[key] = {
				seconds: { },
				minutes: { },
				hours: { }
			}
			for (var k=1;k<=cfg.instances;k++){
				state.groups[key][k] = []	
			}
		}
	}

	function populateBatch(item, granularity){
		var key = item.key
		var batchtotal = 0
		var currentbatch = Math.floor(item.timestamp / secondsIn(granularity)) * secondsIn(granularity)
		batchtotal = state.timebatches[key][granularity][currentbatch]
		state.timebatches[key][granularity][currentbatch] = (batchtotal || 0) + 1
		var maxItems = cfg.window.max[granularity]*cfg.window.clearAt
		if (Object.keys(state.timebatches[key][granularity]).length > maxItems) {
			var windowsize = cfg.window.max[granularity]*secondsIn(granularity)
			for (var unit in state.timebatches[key][granularity]){
				if (unit < currentbatch - windowsize) {
					delete state.timebatches[key][granularity][unit]
					state.cleans+=1
				}
			}
		}
		batchtotal = state.timebatches[DEFAULT_GROUP][granularity][currentbatch]
		state.timebatches[DEFAULT_GROUP][granularity][currentbatch] = (batchtotal || 0) + 1
		if (Object.keys(state.timebatches[DEFAULT_GROUP][granularity]).length > maxItems) {
			var windowsize = cfg.window.max[granularity]*secondsIn(granularity)
			for (var unit in state.timebatches[DEFAULT_GROUP][granularity]){
				if (unit < currentbatch - windowsize) {
					delete state.timebatches[DEFAULT_GROUP][granularity][unit]
					state.cleans+=1
				}
			}
		}
	}

	this.consume = function(item){
		var key = item.key
		this.initKey(key)
		if (cfg.features.count){
			state.totals[key] += 1
			state.totals[DEFAULT_GROUP] += 1			
		}
		if (cfg.features.sliding){
			populateBatch(item, "seconds")
			populateBatch(item, "minutes")
			populateBatch(item, "hours")
		}
		if (cfg.features.unique){
			for (var k=1; k<=cfg.instances; k++){
				var h = utils.hashToBits(item.x, state.seeds[k])
				var tz = utils.countTrailingZeroes(h)
				state.groups[key][k][tz] = item.timestamp
				state.groups[DEFAULT_GROUP][k][tz] = item.timestamp
			}			
		}
		return this
	}

	this.total = function(key, from){
		if (!cfg.features.count) return 0
		key = key || DEFAULT_GROUP
		from = from || { units: 60, type: "seconds"}
		if (!from || !cfg.features.sliding) return state.totals[key] || 0
		var tot = 0
		for (var k in state.timebatches[key][from.type]){
			tot += state.timebatches[key][from.type][k]
		}
		return tot
	}

	this.cleans = function(){
		return state.cleans;
	}

	function secondsIn(dimension){
		if (dimension == "seconds") return 1
		if (dimension == "minutes") return 60
		if (dimension == "hours") return 3600	
		return 1
	}

	this.histogram = function(key, window){
		if (!cfg.features.sliding) return {}
		key = key || DEFAULT_GROUP
		window = window || { units: 60, type: "seconds"}
		var start = Math.floor(moment().subtract(window.units, window.type).unix() / secondsIn(window.type)) * secondsIn(window.type)
		var histogram = {}
		var anyKey = state.timebatches[key]
		var offset = 0
		for (var i=0;i<window.units;i++){
			offset = secondsIn(window.type) * (i+1)
			var histokey = moment( (start + offset)*1000).format()
			histogram[histokey] = 0
			if (anyKey) {
				histogram[histokey] = state.timebatches[key][window.type][start + offset] || 0
			}
		}
		return histogram
	}

	this.uniques = function(key, from){
		if (!cfg.features.unique) return 0
		key = key || DEFAULT_GROUP 
		from = from || 0
		if (!state.groups[key]) return 0
		var estimates = []
		for (var k=1;k<=cfg.instances;k++){
			var r = 0;
			var tzs = state.groups[key][k]
			for (var tz=0;tz<tzs.length;tz++)
				r = ( tzs[tz] >= from && tz > r) ? tz : r;
			estimates.push(Math.floor(Math.pow(2, r) * cfg.correction))
		}
		var chunks = lo.chunk(estimates, Math.ceil(estimates.length / cfg.instanceGroups))
		var total = 0
		for (var ch=0;ch<chunks.length;ch++)
			total += utils.median(estimates)
		return Math.floor(total/chunks.length)
	}

	this.init();
	return this
}
