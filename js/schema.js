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

export class Scores {
    constructor() {
        this.gross = new Array(18).fill(null);
        this.points = new Array(18).fill(null);
    }

    totalGross() {
        return this.gross.reduce((total, value) => total + value, 0);
    }

    totalPoints() {
        return this.points.reduce((total, value) => total + value, 0);
    }
}