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

export const CompetitionType = Object.freeze({
    STABLEFORD: 'stableford',
    STROKEPLAY: 'strokeplay',
    WALTZ: 'walz',
    YELLOW_BALL: 'yellow ball',
    GREENSOMES: 'greensomes',
    PAIRS: 'pairs',
    SCRAMBLE: 'scramble',
    OTHER: 'other'
});
    
export class Competition {
    constructor() {
        this.name = 'Unknown';
        this.date = new Date('1993-01-01');
        this.type = CompetitionType.STABLEFORD;
    }
}

export class Scores {
    constructor(name, date) {
        this.name = name;   //Player name
        this.date = date;   //Competition date
        this.gross = new Array(18).fill(null);      //Gross score for each hole
        this.points = new Array(18).fill(null);     //Stableford points for each hole
        this.adjusted = new Array(18).fill(null);   //Stableford adjusted gross score for each hole
    }
}
