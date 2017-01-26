var config = {
	tester: {
		ips: process.env.IPS,
		keys: process.env.KEYS,
		iterations: process.env.ITERATIONS
	},
	consumer: {
		instances: process.env.INSTANCES,
		instanceGroups: process.env.INSTANCE_GROUP,
		correction: process.env.CORRECTION,
		epsilon: process.env.EPS,
		delta: process.env.DELTA,
		threshold: process.env.THRESHOLD,
		features: {
		}
	},
	factory: {
		
	},
	producer: {
		batchmax: process.env.BATCHMAX,
		batchrate: process.env.BATCHRATE
	}
}

