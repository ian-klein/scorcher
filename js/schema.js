export class Player {
    constructor() {
        this.name = '';
        this.hi = 0;
        this.gender = '';
        this.ph = null;
        this.tees = null;
        this.shots = null;
    }
}

export class Competition {
    constructor() {
        this.name = '';
        this.date = '';
        this.type = 'stableford'; // Options: 'stableford', 'strokeplay', 'other'
    }
}

export class Scores {
    constructor() {
        this.gross = new Array(18).fill(null);      //Gross scor for each hole
        this.points = new Array(18).fill(null);     //Stableford pponts for each hole
        this.adjusted = new Array(18).fill(null);   //Stablefors adjusted score for each hole
    }
}
