"use strict"
class CensusArbiter {
    constructor() {
        this.electionDistricts = [];
        for (var i = 0; i < 4096; i++) {
            this.electionDistricts.push(new ElectionDistrict());
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
    constructor() {
        this.upcoming = false;
        this.voters = [];
    }
    castVote(voterId, color, level) {
        this.upcoming = true;
        let voter = this.voters.find((v) => v.id === voterId);
        if (voter) {
            voter.level = level;
            voter.color = color;
        } else {
            this.voters.push({
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

        this.voters.forEach((nVoter, n) => {
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