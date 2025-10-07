//Functions to get the data from golf genius

'use strict';

import { Player, Competition } from './schema.js';

//Currently stubbed because golf genius API key is suspended

export function getPlayer(email) {
    let p = null;

    if (email === 'ian.klein14@gmail.com') {
        p = new Player();

        p.email = email;
        p.name = 'Ian Klein';
        p.hi = 20.7;
        p.gender = 'male';
    }

    if (email === 'peter.shanks1@gmail.com') {
        p = new Player();

        p.email = email;
        p.name = 'Peter Shanks';
        p.hi = 10.2;
        p.gender = 'male';
    }

    //Add caluculated fields to the player (tees, playing handicap and shots given per hole)

    if (p) {
        if (p.gender === 'male') {
            p.tees = course.male.white;
        } else {
            p.tees = course.female.gold;
        }

        p.ph = Math.round((p.hi * p.tees.sr / 113 + (p.tees.cr - p.tees.parTotal)) * 0.95);

        //Calculate how many shots are given on each hole for this player
        p.shots = new Array(18).fill(0);
        
        const base = Math.trunc(p.ph/18);
        const modulo = p.ph % 18;
        for (let i = 0; i < 18; i++) {
            const si = p.tees.si[i];
            if (modulo >= si) {
                p.shots[i] = base + 1;
            } else {
                p.shots[i] = base;
            }
        }
    }
    return p;
}

export function getCompetition() {
    const c = new Competition();

    c.name = '08/10 Millers Stableford';
    c.date = '08/10/2025';

    //Determine the type of competition
    if (c.name.toLowerCase().includes('medal') || c.name.toLowerCase().includes('strokeplay')) {
        c.type = 'strokeplay';
    } else if (c.name.toLowerCase().includes('stableford')) {
        c.type = 'stableford';
    } else {
        c.type = 'other';
    }

    return c;
}

export const course = {
    male: {
        black: {
            parTotal: 72,
            sr: 129,
            cr: 71.4,
            par: [ 5, 3, 4, 4,  5,  3, 5,  4,  3, 5,  4, 4,  4, 3, 4,  4, 4,  4],
            si:  [12, 4, 2, 8, 16, 18, 6, 10, 14, 7, 17, 3, 15, 9, 1, 13, 5, 11]
        },
        white: {
            parTotal: 72,
            sr: 119,
            cr: 68.6,
            par: [ 5, 3, 4, 4,  5,  3, 5,  4,  3, 5,  4, 4,  4, 3, 4,  4, 4,  4],
            si:  [12, 4, 2, 8, 16, 18, 6, 10, 14, 7, 17, 3, 15, 9, 1, 13, 5, 11]
        },
        gold: {
            parTotal: 69,
            sr: 113,
            cr: 66.6,
            par: [ 5,  3, 4, 4, 4,  3, 4,  4,  3,  4, 4,  4,  4,  3, 4, 4, 4,  4],
            si:  [ 7, 15, 3, 5, 9, 17, 1, 11, 13, 12, 6, 14, 16, 18, 2, 8, 4, 10]
       }
    },
    female: {
        white: {
            parTotal: 72,
            sr: 137,
            cr: 74.5,
            par: [ 5, 3, 4, 4,  5,  3, 5,  4,  3, 5,  4, 4,  4, 3, 4,  4, 4,  4],
            si:  [12, 4, 2, 8, 16, 18, 6, 10, 14, 7, 17, 3, 15, 9, 1, 13, 5, 11]
        },
        gold: {
            parTotal: 72,
            sr: 129,
            cr: 72.4,
            par: [ 5, 3,  4, 4, 5,  3, 5,  4,  3,  5, 4,  4,  4,  3, 4, 4, 4,  4],
            si:  [ 7, 15, 3, 5, 9, 17, 1, 11, 13, 12, 6, 14, 16, 18, 2, 8, 4, 10]
        }
    }
}
