//Functions to get the data from golf genius

'use strict';

import { Player, Competition } from './schema.js';

//Currently stubbed because golf genius API key is suspended

export function getPlayer(email) {
    const p = new Player();

    if (email === 'ian.klein14@gmail.com') {
        p.email = email;
        p.name = 'Ian Klein';
        p.hi = 20.7;
        p.gender = 'male';
    }

    if (email === 'peter.shanks1@gmail.com') {
        p.email = email;
        p.name = 'Peter Shanks';
        p.hi = 10.2;
        p.gender = 'male';
    }

    p.ph = calcPH(p.gender, p.hi);
    return p;
}

export function isValidEmail(email) {
    if (email === 'ian.klein14@gmail.com') {
        return true;
    }
    if (email === 'peter.shanks1@gmail.com') {
        return true;
    }
    return false;
}

export function getCompetition() {
    const c = new Competition();

    c.name = '08/10 Millers Stableford';
    c.date = new Date();

    //Determine the type of competition
    if (c.name.toLowerCase().includes('medal') || c.name.toLowerCase().includes('strokeplay')) {
        c.type = 'strokeplay';
    } else if (c.name.toLowerCase().includes('stableford')) {
        c.type = 'stableford';
    } else {
        c.type = 'team';
    }

    return c;
}

function calcPH(gender, hi) {
    let tees = null;
    if (gender === 'male') {
        tees = course.male.white;
    } else {
        tees = course.female.gold;
    }

    return Math.round(hi * tees.sr / 113 * 0.95);
}

export const course = {
    male: {
        black: {
            par: 72,
            sr: 129,
            cr: 71.4,
            par: [ 5, 3, 4, 4,  5,  3, 5,  4,  3, 5,  4, 4,  4, 3, 4,  4, 4,  4],
            si:  [12, 4, 2, 8, 16, 18, 6, 10, 14, 7, 17, 3, 15, 9, 1, 13, 5, 11]
        },
        white: {
            par: 72,
            sr: 119,
            cr: 68.6,
            par: [ 5, 3, 4, 4,  5,  3, 5,  4,  3, 5,  4, 4,  4, 3, 4,  4, 4,  4],
            si:  [12, 4, 2, 8, 16, 18, 6, 10, 14, 7, 17, 3, 15, 9, 1, 13, 5, 11]
        },
        gold: {
            par: 69,
            sr: 113,
            cr: 66.6,
            par: [ 5,  3, 4, 4, 4,  3, 4,  4,  3,  4, 4,  4,  4,  3, 4, 4, 4,  4],
            si:  [ 7, 15, 3, 5, 9, 17, 1, 11, 13, 12, 6, 14, 16, 18, 2, 8, 4, 10]
       }
    },
    female: {
        white: {
            par: 72,
            sr: 137,
            cr: 74.5,
            par: [ 5, 3, 4, 4,  5,  3, 5,  4,  3, 5,  4, 4,  4, 3, 4,  4, 4,  4],
            si:  [12, 4, 2, 8, 16, 18, 6, 10, 14, 7, 17, 3, 15, 9, 1, 13, 5, 11]
        },
        gold: {
            par: 72,
            sr: 129,
            cr: 72.4,
            par: [ 5, 3,  4, 4, 5,  3, 5,  4,  3,  5, 4,  4,  4,  3, 4, 4, 4,  4],
            si:  [ 7, 15, 3, 5, 9, 17, 1, 11, 13, 12, 6, 14, 16, 18, 2, 8, 4, 10]
        }
    }
}
