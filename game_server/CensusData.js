"use strict"
var CensusArbiter = require('./CensusArbiter.js');

class CensusData {
    constructor() {
        this.districts = []
        for (var i = 0; i < 4096; i++) {
            this.districts.push({
                n:i,
                clr: '',
                lvl: 0
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
            if(electionResult){
                changedDistricts.push(electionResult);
            }
            
        });
        return changedDistricts;
    }

    registerElectionResults(newClr, newLvl, index) {
        index
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
            return this.districts[index];
        }
    }
    
    //maybe need this to keep track of players who disconnect and rejoin.
    registerVoter(id){
        ElectionDistrict.voters.push(id);
    }
    deRegisterVoter(id){
        let index = ElectionDistrict.voters.indexOf(id);
        if (index >= 0) {
            this.units.splice(index, 1);
        }
    }
}

module.exports = CensusData;