//Major entities in scorcher

'use strict';

export class Player {
    constructor(obj) {
        this.email = '';
        this.firstName = '';
        this.lastName = '';
        this.gender = 'male';
        this.hi = 0;
        this.admin = false;
        this.name = '';
        this.team = null; // When a player represents a team with a single score, the player names are stored here
        this.ph = null;
        this.tees = null;
        this.shots = null;
        this.akq = {     //The AKQ hole numbers for an AKQ comp
            ace: -1,
            king: -1,
            queen: -1
        };

        if (obj) {
            Object.assign(this, obj);
        }
    }
}

export class Competition {
    static Type = Object.freeze({
        STABLEFORD: 'stableford',
        STROKEPLAY: 'strokeplay',
        AKQ: 'akq',
        FLAG: 'flag',
        GREENSOMES: 'greensomes',
        FOURSOMES: 'foursomes',
        SCRAMBLE: 'scramble',
        FOURBALL: 'fourball',
        WALTZ: 'waltz',
        YELLOWBALL: 'yellowball',
        BOGEYPAR: 'bogeypar',
        MULTIPLIER: 'multiplier',
        OTHER: 'other'
    });

    static INFO = [
        { type: Competition.Type.STABLEFORD, teamSize: 1, numberOfScores: 1, isSupported: true, scoring: Competition.Type.STABLEFORD },
        { type: Competition.Type.STROKEPLAY, teamSize: 1, numberOfScores: 1, isSupported: true, scoring: Competition.Type.STROKEPLAY },
        { type: Competition.Type.AKQ, teamSize: 1, numberOfScores: 1, isSupported: true, scoring: Competition.Type.STABLEFORD },
        { type: Competition.Type.FLAG, teamSize: 1, numberOfScores: 1, isSupported: true, scoring: Competition.Type.STROKEPLAY },
        { type: Competition.Type.GREENSOMES, teamSize: 2, numberOfScores: 1, isSupported: true, scoring: Competition.Type.STABLEFORD },
        { type: Competition.Type.FOURSOMES, teamSize: 2, numberOfScores: 1, isSupported: true, scoring: Competition.Type.STABLEFORD },
        { type: Competition.Type.SCRAMBLE, teamSize: 3, numberOfScores: 1, isSupported: true, scoring: Competition.Type.STROKEPLAY },
        { type: Competition.Type.FOURBALL, teamSize: 2, numberOfScores: 2, isSupported: true, scoring: Competition.Type.STABLEFORD },
        { type: Competition.Type.WALTZ, teamSize: 3, numberOfScores: 3, isSupported: true, scoring: Competition.Type.STABLEFORD },
        { type: Competition.Type.YELLOWBALL, teamSize: 3, numberOfScores: 3, isSupported: true, scoring: Competition.Type.STABLEFORD },
        { type: Competition.Type.BOGEYPAR, teamSize: 1, numberOfScores: 1, isSupported: true, scoring: Competition.Type.STABLEFORD },
        { type: Competition.Type.MULTIPLIER, teamSize: 2, numberOfScores: 2, isSupported: true, scoring: Competition.Type.STABLEFORD },
        { type: Competition.Type.OTHER, teamSize: 0, numberOfScores: 0, isSupported: false, scoring: Competition.Type.STROKEPLAY },
    ];

    constructor(obj) {
        if (obj) {
            Object.assign(this, obj);
        } else {
            this.name = 'Unknown';
            this.date = '1993-01-01';   //date is represented by a 10 character ISO string
            this.type = Competition.Type.STABLEFORD;
        }
    }

    static supportedTypes() {
        return Competition.INFO.filter(i => i.isSupported).map(i => i.type);
    }

    isSupported() {
        return Competition.INFO.find(i => i.type === this.type).isSupported;
    }

    isIndividualCompetition() {
        return this.teamSize() === 1;
    }

    isTeamCompetition() {
        return this.teamSize() > 1;
    }

    teamSize() {
        return Competition.INFO.find(i => i.type === this.type).teamSize;
    }

    numberOfScores() {
        return Competition.INFO.find(i => i.type === this.type).numberOfScores;
    }

    scoring() {
        return Competition.INFO.find(i => i.type === this.type).scoring;
    }
}

export class Score {
    constructor() {
        this.gross = new Array(18).fill(null);      //Gross score for each hole
        this.points = new Array(18).fill(0);        //Stableford points for each hole
        this.adjusted = new Array(18).fill(null);   //Stableford adjusted gross score for each hole
    }
}

export class Scorecard {
    static FLAG_VALUES = [
        { value: '0', text: '' },
        { value: 'F', text: 'F' },
        { value: 'L', text: 'L' },
        { value: 'A', text: 'A' },
        { value: 'G', text: 'G' }
    ];

    static reviver(key, value) {
        if (key === 'competition') {
            return new Competition(value);
        } else if (key === 'players' || key === 'team') {
            return value?.map(v => new Player(v));
        } else {
            return value;
        }
    }

    static fromJSON(jsonString) {
        const obj = JSON.parse(jsonString, Scorecard.reviver);
        return new Scorecard(obj);
    }

    constructor(obj) {
        if (obj) {
            Object.assign(this, obj);
        } else {
            this.competition = new Competition();
            this.players = [new Player()];
        }

        if (!this.id) {
            this.id = this.players.map(p => p.name).join(' ').replace(/[^a-zA-Z0-9]/g, '-');
        }

        if (!this.scores) {
            this.scores = new Array(this.players.length).fill(null).map(() => new Score());
        }

        if (!this.points) {
            this.points = new Array(18).fill(0);     //Total points for each hole
        }

        if (!this.lostYellowBall) {
            this.lostYellowBall = null;
        }

        if (!this.flag) {
            this.flag = Scorecard.FLAG_VALUES[0].value;
        }

        if (!this.teeShot) {
            this.teeShot = new Array(18).fill(null);    //For scrambles, who took the tee shot for each hole
        }
    }

    validate() {
        const missingScores = [];
        const excessScores = [];
        let errorMsg = null;
        let warningMsg = null;

        if (this.competition.type === Competition.Type.FOURBALL) {
            for (let hole = 1; hole <= 18; hole++) {
                if (!this.scores[0].gross[hole - 1] && !this.scores[1].gross[hole - 1]) {
                    missingScores.push(hole);
                }
                if (this.scores[0].gross[hole - 1] && this.scores[1].gross[hole - 1]) {
                    excessScores.push(hole);
                }
            }
        } else if (this.competition.type === Competition.Type.WALTZ) {
            for (let hole = 1; hole <= 18; hole++) {
                const numRequired = ((hole - 1) % 3) + 1;
                const numEntered = (this.scores[0].gross[hole - 1] ? 1 : 0) + (this.scores[1].gross[hole - 1] ? 1 : 0) + (this.scores[2].gross[hole - 1] ? 1 : 0);
                if (numEntered < numRequired) {
                    missingScores.push(hole);
                }
                if (numEntered > numRequired) {
                    excessScores.push(hole);
                }
            }

        } else if (this.competition.type === Competition.Type.FLAG) {
            let shotsRemaining = Number(this.players[0].tees.parTotal) + Number(this.players[0].ph);
            for (let hole = 1; hole <= 18; hole++) {
                const shotsConsumed = this.scores[0].gross[hole - 1];
                if (shotsRemaining <= 0) {
                    if (shotsConsumed && shotsConsumed !== 'X') {
                        excessScores.push(hole);
                    }
                } else {
                    if (!shotsConsumed) {
                        missingScores.push(hole);
                    } else if (shotsConsumed === 'X') {
                        shotsRemaining = -1;
                    } else {
                        shotsRemaining -= Number(shotsConsumed);
                    }
                }
            }
        } else {
            for (let hole = 1; hole <= 18; hole++) {
                const grossScores = this.scores.map(s => s.gross[hole - 1]);
                if (grossScores.includes(null)) {
                    missingScores.push(hole);
                }
            }
        }

        //Return the errors message - null means the scorecard is valid
        if (missingScores.length > 0 || excessScores.length > 0) {
            const missingholes = missingScores.join(', ');
            const excessholes = excessScores.join(', ');
            errorMsg = 'Error:\n';

            if (missingScores.length > 0) {
                errorMsg = errorMsg + 'There are missing scores on hole(s):  ' + missingholes + '\n';
            }
            if (excessScores.length > 0) {
                errorMsg = errorMsg + 'There are too many scores on hole(s): ' + excessholes + '\n';
            }
        }

        if (this.competition.type === Competition.Type.SCRAMBLE) {
            const a = this.teeShot.filter(t => t === 'A').length;
            const b = this.teeShot.filter(t => t === 'B').length;
            const c = this.teeShot.filter(t => t === 'C').length;
            if (a < 5 || b < 5 || c < 5) {
                warningMsg = 'Warning:\n';

                if (a < 5) {
                    warningMsg = warningMsg + `Player A is missing ${5 - a} tee shots\n`;
                }
                if (b < 5) {
                    warningMsg = warningMsg + `Player B is missing ${5 - b} tee shots\n`;
                }
                if (c < 5) {
                    warningMsg = warningMsg + `Player C is missing ${5 - c} tee shots`;
                }
            }
        }

        return { errorMsg, warningMsg };
    }
}