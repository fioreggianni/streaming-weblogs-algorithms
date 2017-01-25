var defaultsDeep = require('lodash.defaultsdeep')
var config = {
	tester: {
		ips: process.env.IPS,
		keys: process.env.KEYS,
		iterations: process.env.ITERATIONS,
		
	},
	consumer: {
		instances: process.env.INSTANCES,
		instanceGroups: process.env.INSTANCE_GROUP,
		correction: process.env.CORRECTION,
		epsilon: process.env.EPS,
		delta: process.env.DELTA,
		threshold: process.env.THRESHOLD
	},
	factory: {
		
	},
	producer: {
		batchmax: process.env.BATCHMAX,
		batchrate: process.env.BATCHRATE
	}
}

var defaultConfig = {
	tester: {
		ips: 256,
		keys: 150,
		iterations: 100000,
		rate: 1000
	},
	consumer: {
		instances: 1,
		instanceGroups: 1,
		correction: 1,
		window: {
			max: {
				"seconds": 5,
				"minutes": 10,
				"hours": 24
			},
			clearAt: 2
		},
		epsilon: 0.1,
		delta: 0.1,
		threshold: 0.1
	},
	producer: {
		batchmax: 10,
		batchrate: 1000
	}
}

module.exports = defaultsDeep(config,defaultConfig)