export class Player {
    constructor() {
        this.email = '';
        this.firstName = '';
        this.lastName = '';
        this.gender = '';
        this.admin = false;
        this.name = '';
        this.hi = 0;
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
    constructor(name, date) {
        this.name = name;
        this.date = date;
        this.gross = new Array(18).fill(null);      //Gross score for each hole
        this.points = new Array(18).fill(null);     //Stableford points for each hole
        this.adjusted = new Array(18).fill(null);   //Stableford adjusted gross score for each hole
    }
}
