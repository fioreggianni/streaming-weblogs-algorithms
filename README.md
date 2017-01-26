# Streaming Weblogs Algorithms

Some real-time algorithms to track logs on a web server.
Input stream can be simulated using `item_factory` and `testers/` runners:
- `npm run unique-test`: number of unique items found, 
given an execution with 512 unique IPs shuffled over 100k items. Executes a multi-instance (50) and multi-group (5 groups, 10 each) Flajolet-Martin algorithm.
To change parameters specifically: `ITERATIONS=100000 IPS=512 INSTANCES=50 INSTANCE_GROUP=5 npm run unique-test`
- `npm run sliding-count-test`: live console histograms showing total items in recent timeframes, 
having a items stream producer generating a batch of 10 items every 1000 milliseconds, using 10 different keys (identifiers of the item category).
To change parameters specifically: `KEYS=10 BATCHMAX=10 BATCHRATE=1000 npm run unique-test`

![A gif demo: sliding window counters aggregation](static/img/demo.gif?raw=true "Demo")
