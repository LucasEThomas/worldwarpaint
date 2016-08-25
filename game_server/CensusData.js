"use strict"
var CensusArbiter = require('./CensusArbiter.js');

class CensusData {
	constructor() {
		this.districts = [];
		for (var i = 0; i < 4096; i++) {
			this.districts.push({
				n: i,
				clr: '',
				lvl: 0,
				callbacks: []
			});
		}
		this.totalColorScores = {
			blue: 0,
			teal: 0,
			white: 0,
			yellow: 0,
			orange: 0,
			red: 0,
			magenta: 0,
			violet: 0
		};

		this.arbiter = new CensusArbiter();
	}

	holdElections() {
		let changedDistricts = [];
		this.arbiter.holdElections().forEach(([nColor, nLevel, nIndex], n) => {
			let electionResult = this.registerElectionResults(nColor, nLevel, nIndex);
			if (electionResult) {
				changedDistricts.push(electionResult);
			}

		});
		return changedDistricts;
	}

	registerElectionResults(newClr, newLvl, index) {
		let oldClr = this.districts[index].clr;
		let oldLvl = this.districts[index].lvl;

		this.districts[index].clr = newClr;
		this.districts[index].lvl = newLvl;

		if (oldClr === newClr) {
			this.totalColorScores[newClr] += (newLvl - oldLvl);
		} else {
			this.totalColorScores[oldClr] -= (oldLvl);
			this.totalColorScores[newClr] += (newLvl);
		}
		if (oldClr != newClr || oldLvl != newLvl) {
			this.districts[index].callbacks.forEach((nCallback) => nCallback(this.districts[index]));
			return this.districts[index];
		}
	}

	//maybe need this to keep track of players who disconnect and rejoin.
	registerVoter(id) {
		this.arbiter.voterIds.push(id);
	}
	deRegisterVoter(id) {
		let index = this.arbiter.voterIds.indexOf(id);
		if (index >= 0) {
			this.arbiter.voterIds.splice(index, 1);
		}
	}
	subscribeToDistrict(x, y, callback) {
		let index = this.convertXYToIndex(x, y);
		this.districts[index].callbacks.push(callback);
	}
	unsubscribeFromDistrict(x, y, callback) {
		let index = this.convertXYToIndex(x, y);
		let callbackIndex = this.districts[index].callbacks.indexOf(callback);
		this.districts[index].callbacks.splice(callbackIndex, 1);
	}
	convertXYToIndex(x, y) { //takes pixel coordinates, returns index of the corresponding district
		x = Math.floor(x * 0.03125); //same as x/32, but faster
		y = Math.floor(y * 0.03125);
		return (x + y * 64);
	}
}

module.exports = CensusData;