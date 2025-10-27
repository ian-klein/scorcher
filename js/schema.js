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
        this.team = null; // When a player represents a team with a single score, the player names are stored here
        this.ph = null;
        this.tees = null;
        this.shots = null;
    }
}

export class Competition {
    static Type = Object.freeze({
        STABLEFORD: 'stableford',
        STROKEPLAY: 'strokeplay',
        AKQ:        'akq',
        FLAG:       'flag',
        GREENSOMES: 'greensomes',
        FOURSOMES:  'foursomes',
        SCRAMBLE:   'scramble',
        FOURBALLS:  'fourballs',
        WALTZ:      'waltz',
        YELLOW_BALL:'yellow ball',
        OTHER:      'other'
    });
    
    static supportedTypes = [
        Competition.Type.STABLEFORD,
        Competition.Type.STROKEPLAY,
        Competition.Type.GREENSOMES,
        Competition.Type.FOURSOMES,
        Competition.Type.SCRAMBLE,
        Competition.Type.FOURBALLS,
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
        return this.teamSize() === 1;
    }

    isTeamCompetition() {
        return this.teamSize() > 1;
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

    numberOfScores() {
        switch(this.type) {
            case Competition.Type.STABLEFORD:
            case Competition.Type.STROKEPLAY:
            case Competition.Type.FOURSOMES:
            case Competition.Type.GREENSOMES:
            case Competition.Type.SCRAMBLE:
                return 1;   
            case Competition.Type.FOURBALLS:
                return 2;
            case Competition.Type.WALTZ:
            case Competition.Type.YELLOW_BALL:
                return 3;
            case Competition.Type.OTHER:
                return 0;
            default:
                return 1;
        }
    }
}

export class Score {
    constructor(player, date) {
        //These 3 fields are used to identify the score in case the team changes
        this.email = player.email;
        this.name = player.name;
        this.date = date; //of competition

        this.gross = new Array(18).fill(null);      //Gross score for each hole
        this.points = new Array(18).fill(null);     //Stableford points for each hole
        this.adjusted = new Array(18).fill(null);   //Stableford adjusted gross score for each hole
    }
}
