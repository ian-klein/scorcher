//Functions to get the data from golf genius

'use strict';

import { Player, Competition } from './schema.js';
import { bootstrap } from './bootstrap.js';
import { readFile } from './backend.js';

//Currently stubbed because golf genius API key is suspended
//Current approach is to assum the Golf Genius is unavailble

let eventDiary = [];
let players = [];
let admins = [];
let course = null;

export async function loadData() {
    await loadEventDiary();
    await loadPlayers();
    await loadCourse();
}

async function loadEventDiary() {
    try {
        const result = await readFile('diary');
        eventDiary = result.events;
    } catch (error) {
        eventDiary = bootstrap.diary.events;
    }
    for(const e of eventDiary) {
        e.date = new Date(e.date);
    }
}

async function loadPlayers() {
    try {
        const result = await readFile('players');
        players = result.players;
    } catch (error) {
        players = bootstrap.players.players;
    }

    try {
        const result = await readFile('admin');
        admins = result.admins;
    } catch (error) {
        admins = bootstrap.admins;
    }
}

async function loadCourse() {
    course = bootstrap.course; //For now, this can only be canged by code
}

export function getCompetition(date) {
    const eventDate = date || new Date();
    const event = eventDiary.find(c => c.date.toISOString().slice(0, 10) >= eventDate.toISOString().slice(0, 10));

    return event ? event : new Competition();
}

export function competitionDisplayName(c) {
    const day = c.date.getDate().toString().padStart(2, '0');
    const month = (c.date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month} Millers ${c.name}`;
}

export function getPlayer(email, ph) {
    const p = players.find(p => p.email === email);

    if (p) {
        //Add caluculated fields to the player (tees, playing handicap and shots given per hole)
        if (p.gender === null) {
            p.gender = 'male';
        }

        p.name = p.firstName + ' ' + p.lastName;

        //Set tees based on gender
        if (p.gender === 'male') {
            p.tees = course.male.white;
        } else {
            p.tees = course.female.gold;
        }

        //Set playing handicap
        if (ph) {
            p.ph = ph;
        } else if (p.hi) {
            p.ph = Math.round((p.hi * p.tees.sr / 113 + (p.tees.cr - p.tees.parTotal)) * 0.95);
        }
        else {
            p.ph = 0;
        }

        //Check if this player is an admin
        p.admin = admins.includes(email);

        //Calculate how many shots are given on each hole for this player
        p.shots = new Array(18).fill(0);
        
        const base = Math.trunc(p.ph/18);   // Get this many shots for all holes
        const modulo = p.ph % 18;           // Get 1 extra shot on holes with si up to and includiong "modulo"
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

export function getPlayers() {
    return players;
}  

export function getAdmins() {
    return admins;
}

export function getEventDiary() {
    return eventDiary;
}
    