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
    WALTZ: 'waltz',
    YELLOW_BALL: 'yellow ball',
    GREENSOMES: 'greensomes',
    FOURSOMES: 'foursomes',
    FOURBALLS: 'fourballs',
    SCRAMBLE: 'scramble',
    OTHER: 'other'
});
    
export class Competition {
    static supportedTypes = [
        CompetitionType.STABLEFORD,
        CompetitionType.STROKEPLAY,
        CompetitionType.WALTZ
    ];

    constructor() {
        this.name = 'Unknown';
        this.date = new Date('1993-01-01');
        this.type = CompetitionType.STABLEFORD;
    }

    isSupported() {
        return Competition.supportedTypes.includes(this.type);
    }

    isIndividualCompetition() {
        return this.type === CompetitionType.STABLEFORD || this.type === CompetitionType.STROKEPLAY;
    }

    isTeamCompetition() {
        return this.type === CompetitionType.PAIRS || 
               this.type === CompetitionType.SCRAMBLE ||
               this.type === CompetitionType.WALTZ ||
               this.type === CompetitionType.GREENSOMES ||
               this.type === CompetitionType.YELLOW_BALL;
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
