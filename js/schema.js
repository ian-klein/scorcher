//Major entities in scorcher

'use strict';

export class Player {
    constructor(obj) {
        if (obj) {
            Object.assign(this, obj);
        } else {
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
        FOURBALL:   'fourball',
        WALTZ:      'waltz',
        YELLOW_BALL:'yellowball',
        OTHER:      'other'
    });

    static Info = [
        {type: Competition.Type.STABLEFORD,  teamSize: 1, numberOfScores: 1, isSupported: true,  scoring: Competition.Type.STABLEFORD },
        {type: Competition.Type.STROKEPLAY,  teamSize: 1, numberOfScores: 1, isSupported: true,  scoring: Competition.Type.STROKEPLAY },
        {type: Competition.Type.AKQ,         teamSize: 1, numberOfScores: 1, isSupported: false, scoring: Competition.Type.AKQ },
        {type: Competition.Type.FLAG,        teamSize: 1, numberOfScores: 1, isSupported: false, scoring: Competition.Type.STROKEPLAY },
        {type: Competition.Type.GREENSOMES,  teamSize: 2, numberOfScores: 1, isSupported: true,  scoring: Competition.Type.STABLEFORD },
        {type: Competition.Type.FOURSOMES,   teamSize: 2, numberOfScores: 1, isSupported: true,  scoring: Competition.Type.STABLEFORD },
        {type: Competition.Type.SCRAMBLE,    teamSize: 3, numberOfScores: 1, isSupported: true,  scoring: Competition.Type.STROKEPLAY },
        {type: Competition.Type.FOURBALL,   teamSize: 2, numberOfScores: 2, isSupported: false, scoring: Competition.Type.STABLEFORD },
        {type: Competition.Type.WALTZ,       teamSize: 3, numberOfScores: 3, isSupported: false, scoring: Competition.Type.WALTZ },
        {type: Competition.Type.YELLOW_BALL, teamSize: 3, numberOfScores: 3, isSupported: false, scoring: Competition.Type.YELLOW_BALL },
        {type: Competition.Type.OTHER,       teamSize: 0, numberOfScores: 0, isSupported: false, scoring: Competition.Type.STROKEPLAY },
    ];
    
    constructor(obj) {
        if (obj) {
            Object.assign(this, obj);
            this.date = new Date(this.date);
        } else {
            this.name = 'Unknown';
            this.date = new Date('1993-01-01');
            this.type = Competition.Type.STABLEFORD;
        }
    }

    isSupported() {
        return Competition.Info.find(i => i.type === this.type).isSupported;
    }

    isIndividualCompetition() {
        return this.teamSize() === 1;
    }

    isTeamCompetition() {
        return this.teamSize() > 1;
    }

    teamSize() {
        return Competition.Info.find(i => i.type === this.type).teamSize;
    }

    numberOfScores() {
        return Competition.Info.find(i => i.type === this.type).numberOfScores;
    }

    scoring() {
        return Competition.Info.find(i => i.type === this.type).scoring;
    }
}

export class Score {
    constructor(player, date) {
        //These 3 fields are used to identify the score in case the team changes
        this.email = player.email;
        this.name = player.name;
        this.date = date;           // ... of the Competition for which this score is being entered

        this.gross = new Array(18).fill(null);      //Gross score for each hole
        this.points = new Array(18).fill(null);     //Stableford points for each hole
        this.adjusted = new Array(18).fill(null);   //Stableford adjusted gross score for each hole
        this.teeShot = new Array(18).fill(null);    //For scrambles, who took the tee shot for each hole
    }
}
