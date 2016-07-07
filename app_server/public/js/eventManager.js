class EventManager {
    constructor() {
        this.eventQueue = [];
    }
    queueEvents(events) {
        //A new list of events has come down from the server. Each one needs to scheduled in the eventQueue.
        //console.log(events);
        for (var i = 0; i < 5; i += 1) {
            let event = events[i];
            event.scheduledTime = Date.now() + i * 50;
            this.eventQueue.push(event);
        }
    }

    update() {
        //if the time has come for the next item in the queue to be executed, add it to the render queue
        if (this.eventQueue.length && this.eventQueue[0].scheduledTime <= Date.now()) {
            let currentTimeSlot = this.eventQueue.shift();
            currentTimeSlot.forEach((nEvent, n) => {
                if (nEvent.unitId) {
                    let unit = game.units.units.find((t) => t.id === nEvent.unitId)
                    if (unit) {
                        unit.processEvent(nEvent);
                    }
                } else if (nEvent.type === 'manualSplatter') {
                    let clr = game.players.getClr(nEvent.ownerId);
                    let splatter = nEvent;
                    game.gameBoardLayer.stageSplatter(splatter.x, splatter.y, splatter.radius, clr, splatter.inputIndex);
                } else if (nEvent.type === 'districtUpdate') {
                    console.log(nEvent);
                }
            });
        }
        //bandaid fix for when the browser looses focus and the eventQueue just piles up. Don't wanna memory leak!
        if (this.eventQueue.length > 10) {
            this.eventQueue.length = 0;
        }
    }
}