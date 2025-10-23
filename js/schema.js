//Major entities in scorcher

'use strict';

export class Player {
    constructor() {
        this.email = '';
        this.firstName = '';
        this.lastName = '';
        this.gender = '';
        this.hi = 0;
        this.admin = false;
        this.name = '';
        this.ph = null;
        this.tees = null;
        this.shots = null;
    }
}

export class Competition {
        static Type = Object.freeze({
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
    
    static supportedTypes = [
        Competition.Type.STABLEFORD,
        Competition.Type.STROKEPLAY,
        Competition.Type.WALTZ
    ];

    constructor() {
        this.name = 'Unknown';
        this.date = new Date('1993-01-01');
        this.type = Competition.Type.STABLEFORD;
    }

    isSupported() {
        return Competition.supportedTypes.includes(this.type);
    }

    isIndividualCompetition() {
        return this.type === Competition.Type.STABLEFORD || this.type === Competition.Type.STROKEPLAY;
    }

    isTeamCompetition() {
        return this.type !== Competition.Type.OTHER && !this.isIndividualCompetition();
    }

    teamSize() {
        switch(this.type) {
            case Competition.Type.FOURSOMES:
            case Competition.Type.GREENSOMES:
            case Competition.Type.FOURBALLS:
                return 2;   
            case Competition.Type.SCRAMBLE:
            case Competition.Type.WALTZ:
            case Competition.Type.YELLOW_BALL:
                return 3;
            case Competition.Type.STABLEFORD:
            case Competition.Type.STROKEPLAY:
                return 1;
            case Competition.Type.OTHER:
                return 0;
            default:
                return 0;
        }
    }

    isTeamHandicap() {
        return this.type === Competition.Type.FOURSOMES || 
               this.type === Competition.Type.GREENSOMES ||
               this.type === Competition.Type.SCRAMBLE;
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
