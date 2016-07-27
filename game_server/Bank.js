"use strict";

class Bank {
    constructor(censusResults) {
        this.accounts = [];
        this.censusResults = censusResults;
    }
    createAccount(player) {
        let newAccount = new bankAccount(player)
        this.accounts.push(newAccount);
    }
    updateBankAccounts() {
        this.accounts.forEach((nAcnt) => {
            nAcnt.rate = this.censusResults[nAcnt.player.clrName];
            nAcnt.amount += nAcnt.rate;
        });
    }
    transmitBankStatements() {
        this.accounts.forEach((nAccount, n) => {
            nAccount.player.syncMoney(nAccount.amount, nAccount.rate);
        });
    }
}
class bankAccount {
    constructor(player) {
        this.amount = 0;
        this.rate = 0;
        this.player = player;
    }
}

module.exports = Bank;