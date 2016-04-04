"use strict";

class Player {    
    constructor(type, id) {
        this.id = id || Math.generateUUID();
        this.clr = {};
        this.type = type;
    }
}

