//Functions to get the data from golf genius

'use strict';

import { Player, Competition } from './schema.js';
import { bootstrap } from './bootstrap.js';
import { backend } from './backend.js';

//Current approach is to assume the Golf Genius is unavailble, and work with data files provided by the admin user

class Data {
    constructor() {
        this.eventDiary = [];
        this.players = [];
        this.admins = [];
        this.course = null;
    }


    async loadData() {
        await this.#loadEventDiary();
        await this.#loadPlayers();
        await this.#loadCourse();
    }

    async #loadEventDiary() {
        const result = await backend.readFile('diary');
        if (result && Array.isArray(result.events)) {
            this.eventDiary = result.events;
        } else {
            this.eventDiary = bootstrap.diary.events;
        }
        for(const e of this.eventDiary) {
            e.date = new Date(e.date);
        }
    }

    async #loadPlayers() {
        const result = await backend.readFile('players');
        if (result && Array.isArray(result.players)) {
            this.players = result.players;
        } else {
            this.players = bootstrap.players.players;
        }

        const result2 = await backend.readFile('admin');
        if (result2 && Array.isArray(result2.admins)) {
            this.admins = result2.admins;
        } else {
            this.admins = bootstrap.admins;
        }
    }

    async #loadCourse() {
        this.course = bootstrap.course; //For now, this can only be canged by code
    }

    getCompetition(date) {
        const eventDate = date || new Date();
        const event = this.eventDiary.findLast(c => c.date.toISOString().slice(0, 10) <= eventDate.toISOString().slice(0, 10));

        return event ? event : new Competition();
    }

    competitionDisplayName(c) {
        const day = c.date.getDate().toString().padStart(2, '0');
        const month = (c.date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}/${month} Millers ${c.name}`;
    }

    getPlayer(email, ph) {
        const p = this.players.find(p => p.email === email);

        if (p) {
            //Add caluculated fields to the player (tees, playing handicap and shots given per hole)
            if (!p.gender) {
                p.gender = 'male';
            }

            p.name = p.firstName + ' ' + p.lastName;

            //Set tees based on gender
            if (p.gender === 'male') {
                p.tees = this.course.male.white;
            } else {
                p.tees = this.course.female.gold;
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
            p.admin = this.admins.includes(email);

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
}

export const data = new Data();
    