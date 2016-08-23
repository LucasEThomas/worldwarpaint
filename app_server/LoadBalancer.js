var pubsub = require('@google-cloud/pubsub')();

class LoadBalancer {
	constructor() {
		//pubsub setup
		let topic = pubsub.topic('server-health-topic');
		this.subscription = topic.subscription('my-subscription');
		this.subscription.on('message', (message)=> this.pubsubmessage);


		aliveRoomServers = {};
		aliveGameServers = {};

		this.heartBeatInterval = setInterval(() => this.transmitHeartbeat(), 10000);
	}

	incomingRoomHeartbeat(ip, timestamp) {
		let server = aliveRoomServers[ip];
		if (server)
			aliveRoomServers[ip].timestamp = timestamp;
		else
			aliveRoomServers[ip] = new Server(ip, timestamp);
	}
	incomingGameHeartbeat(ip, timestamp) {
		let server = aliveGameServers[ip];
		if (server)
			aliveGameServers[ip].timestamp = timestamp;
		else
			aliveGameServers[ip] = new Server(ip, timestamp);

		//the reason we use the incoming timestamp rather than Date.now(), is to ensure that this operation happens exactly the same on every server.
		forgetDeadServers(timestamp);
	}

	transmitHeartbeat() {
		//pubsub tx goes here
	}
	forgetDeadServers(timestamp) { //forgets servers that haven't sent a heartbeat for 30 seconds.
		let deadTime = timestamp - 30000;
		aliveRoomServers = aliveRoomServers.filter((nServer) => nServer.timestamp <= deadTime);
		aliveGameServers = aliveGameServers.filter((nServer) => nServer.timestamp <= deadTime);
	}
}

class Server {
	constructor(ip, timestamp) {
		this.ip = ip;
		this.lastHeartbeat = timestamp;
	}
}