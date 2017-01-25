var moment = require("moment")
var sha1 = require('sha1')
var utils = require("./lib/utils.js")
var lo = require('lodash/array')

var euler = 2.718281828459045;
module.exports = function(config){
	var cfg = config
	var state = {
		seeds: [],
		counts: [],
		total: 0,
		tops: {}
	}
	var DEFAULT_GROUP = -1

	this.init = function(){
		cfg.w = Math.round(euler / cfg.epsilon)
		cfg.d = Math.round(Math.log(1 / cfg.delta))
		console.log("w is "+cfg.w+", d is "+cfg.d)
		for (var j=1;j<=cfg.d;j++) {
			state.seeds[j] = Math.random()
			state.counts[j] = []
			for (var h=1;h<=cfg.w;h++) {
				state.counts[j][h] = 0				
			}
		}
		return this
	}

	this.initKey = function(key){
	}

	this.consume = function(item){
		var ip = item.x
		console.log("consuming ip "+ip)
		this.initKey(ip)
		var min = "n/a"
		state.total += 1
		for (var j=1; j<=cfg.d; j++){
			var h = utils.hashToBucket(ip, state.seeds[j], cfg.w)
			console.log("h is "+h)
			if (!state.counts[j][h]) state.counts[j][h] = 1
			else state.counts[j][h] += 1
			
			if (min == "n/a") min = state.counts[j][h]
			else min = Math.min(min, state.counts[j][h])
		}
		console.log("min is "+min+", threshold is "+cfg.threshold*state.total)
		if (min >= cfg.threshold*state.total) {
			state.tops[ip] = min	
		} 
		return this
	}

	this.tops = function(){
		return state.tops;
	}
	
	this.memory = function(){
		return 0
	}

	this.init();
	return this
}
