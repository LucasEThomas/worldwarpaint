var gcloud = require('gcloud');
var datastore = gcloud.datastore();

class RoomsDatastore {
	constructor() {
		if (!process.env.GCLOUD_PROJECT) {
			console.error('GCLOUD_PROJECT environment variable required.');
		}
	}

	addRoom(description, roomIp, gameIp, privateRoom, gameStartTime, callback) {
		let roomKey = datastore.key('Room');

		datastore.save({
			key: roomKey,
			data: [
				{
					name: 'roomIp',
					value: roomIp
						},
				{
					name: 'gameIp',
					value: gameIp
						},
				{
					name: 'gameStartTime',
					value: gameStartTime,
						},
				{
					name: 'privateRoom',
					value: privateRoom
						},
				{
					name: 'players',
					value: description,
					excludeFromIndexes: true
						}
					]
		}, (err) => {
			if (err) {
				callback(err);
				return;
			}
			callback(null, roomKey);
		});
	}

	setRoomPrivacy(roomId, privateRoom, callback) {
		var error;

		datastore.runInTransaction((transaction, done) => {
			let taskKey = datastore.key(['Task', roomId]);

			transaction.get(taskKey, function(err, task) {
				if (err) {
					// An error occurred while getting the values.
					error = err;
					transaction.rollback(done);
					return;
				}

				task.data.privateRoom = privateRoom;

				transaction.save(task);

				// Commit the transaction.
				done();
			});
		}, (transactionError) => {
			if (transactionError || error) {
				return callback(transactionError || error);
			}
			// The transaction completed successfully.
			callback();
		});
	}

	listPublicRooms(callback) {
		let query = datastore.createQuery('Task')
			.order('created');

		datastore.runQuery(query, callback);
	}

	deleteRoom(roomId, callback) {
		let roomKey = datastore.key(['Room', roomId]);

		datastore.delete(roomKey, callback);
	}
}

class RoomServersDatastore {
	constructor() {
		if (!process.env.GCLOUD_PROJECT) {
			console.error('GCLOUD_PROJECT environment variable required. bla');
		}
	}

	add(roomIp, callback) {
		let roomServerKey = datastore.key('RoomServer');

		datastore.save({
			key: roomServerKey,
			data: [
				{
					name: 'ip',
					value: roomIp
				},
				{
					name: 'memUsage',
					value: 0,
				},
				{
					name: 'cpuUsage',
					value: 0
				},
				{
					name: 'numOfPlayers',
					value: 0
				},
				{
					name: 'numOfGames',
					value: 0
				},
			]
		}, (err) => {
			if (err) {
				callback(err);
				return;
			}
			callback(null, roomServerKey);
		});
	}

	setHealthStats(gameServerId, memUsage, cpuUsage, numOfPlayers, numOfGames, callback) {
		var error;

		datastore.runInTransaction((transaction, done) => {
			let serverKey = datastore.key(['RoomServer', roomId]);

			transaction.get(serverKey, function(err, server) {
				if (err) {
					// An error occurred while getting the values.
					error = err;
					transaction.rollback(done);
					return;
				}

				server.data.memUsage = memUsage;
				server.data.cpuUsage = cpuUsage;
				server.data.numOfPlayers = numOfPlayers;
				server.data.numOfGames = numOfGames;

				transaction.save(server);

				// Commit the transaction.
				done();
			});
		}, (transactionError) => {
			if (transactionError || error) {
				return callback(transactionError || error);
			}
			// The transaction completed successfully.
			callback();
		});
	}

	listAllServers(callback) {
		let query = datastore.createQuery('RoomServer')
			.order('numOfPlayers');

		datastore.runQuery(query, callback);
	}

	deleteServer(serverId, callback) {
		let serverKey = datastore.key(['RoomServer', serverId]);

		datastore.delete(serverKey, callback);
	}
}

class GameServersDatastore {
	constructor() {
		if (!process.env.GCLOUD_PROJECT) {
			console.error('GCLOUD_PROJECT environment variable required.');
		}
	}

	addRoom(description, serverIp, callback) {
		let gameServerKey = datastore.key('GameServer');

		datastore.save({
			key: gameServerKey,
			data: [
				{
					name: 'ip',
					value: serverIp
				},
				{
					name: 'memUsage',
					value: 0,
				},
				{
					name: 'cpuUsage',
					value: 0
				},
				{
					name: 'numOfPlayers',
					value: 0
				},
				{
					name: 'numOfGames',
					value: 0
				},
			]
		}, (err) => {
			if (err) {
				callback(err);
				return;
			}
			callback(null, gameServerKey);
		});
	}

	setHealthStats(gameServerId, memUsage, cpuUsage, numOfPlayers, numOfGames, callback) {
		var error;

		datastore.runInTransaction((transaction, done) => {
			let serverKey = datastore.key(['GameServer', roomId]);

			transaction.get(serverKey, function(err, server) {
				if (err) {
					// An error occurred while getting the values.
					error = err;
					transaction.rollback(done);
					return;
				}

				server.data.memUsage = memUsage;
				server.data.cpuUsage = cpuUsage;
				server.data.numOfPlayers = numOfPlayers;
				server.data.numOfGames = numOfGames;

				transaction.save(server);

				// Commit the transaction.
				done();
			});
		}, (transactionError) => {
			if (transactionError || error) {
				return callback(transactionError || error);
			}
			// The transaction completed successfully.
			callback();
		});
	}

	listAllServers(callback) {
		let query = datastore.createQuery('GameServer')
			.order('numOfPlayers');

		datastore.runQuery(query, callback);
	}

	deleteServer(serverId, callback) {
		let serverKey = datastore.key(['GameServer', serverId]);

		datastore.delete(serverKey, callback);
	}
}

module.exports.RoomsDatastore = RoomsDatastore;
module.exports.RoomServersDatastore = RoomServersDatastore;
module.exports.GameServersDatastore = GameServersDatastore;