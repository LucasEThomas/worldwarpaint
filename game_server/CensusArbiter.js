"use strict"
class CensusArbiter {
	constructor() {
		this.voterIds = [];
		this.electionDistricts = [];
		for (var i = 0; i < 4096; i++) {
			this.electionDistricts.push(new ElectionDistrict(this.voterIds));
		}
	}
	processVotes(player, votes) {
		votes.forEach((nVote, n) => {
			this.electionDistricts[nVote.location].castVote(player.id, nVote.color, nVote.level)
		});
	}

	holdElections() {
		let results = [];
		this.electionDistricts.forEach((nElection, n) => {
			let result = nElection.holdElection();
			if (result) {
				results.push([result.color, result.level, n]);
			}
		});
		return results;
	}
}

class ElectionDistrict {
	constructor(registeredVoterIds) {
		this.upcoming = false;
		this.registeredVoterIds = registeredVoterIds;
		this.votes = [];
	}
	castVote(voterId, color, level) {
		this.upcoming = true;
		let vote = this.votes.find((v) => v.id === voterId);
		if (vote) {
			vote.level = level;
			vote.color = color;
		} else {
			this.votes.push({
				id: voterId,
				color: color,
				level: level
			});
		}
	}
	holdElection() {
		if (this.upcoming === false) {
			return null;
		}
		let nominations = [{
			level: 0,
			color: 'none',
			votes: 0
        }];

		//strip out any votes from unregistered voters (ie, clients who have disconnected)
		
		this.votes = this.votes.filter((nVote) => this.registeredVoterIds.indexOf(nVote.id) >= 0);

		this.votes.forEach((nVoter, n) => {
			let nomination = nominations.find((nom) => nom.color === nVoter.color && nom.level === nVoter.level);
			if (!nomination) {
				nominations.push({
					level: nVoter.level,
					color: nVoter.color,
					votes: 1
				});
			} else {
				nomination.votes += 1;
			}
		});

		let winner = nominations[0];
		nominations.forEach((nNom, n) => {
			if (nNom.votes > winner.votes)
				winner = nNom;
		});
		this.upcoming = false;
		return winner;
	}
}

module.exports = CensusArbiter;