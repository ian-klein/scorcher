export class Player {
    constructor() {
        this.name = '';
        this.hi = 0;
        this.gender = '';
        this.ph = null;
    }
}

export class Competition {
    constructor() {
        this.name = '';
        this.date = '';
        this.type = 'stableford'; // Options: 'stableford', 'strokeplay', 'team'
    }
}

export class Score {
    constructor() {
        this.player = new Player();
        this.gross = [];
        this.points = [];
        this.totalGross = 0;
        this.totalPoints = 0;
    }
}