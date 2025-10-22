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
        this.course = bootstrap.course; //For now, this can only be changed by code
    }

    getCompetition(date) {
        const eventDate = date || new Date();
        const event = this.eventDiary.findLast(c => c.date.toISOString().slice(0, 10) <= eventDate.toISOString().slice(0, 10));

        const comp = new Competition();
        if (event) {
            comp.name = event.name
            comp.date = event.date;
            comp.type = event.type;
        }    

        return comp;
    }

    competitionDisplayName(c) {
        const day = c.date.getDate().toString().padStart(2, '0');
        const month = (c.date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}/${month} Millers ${c.name}`;
    }

    getPlayer(email, ph) {
        const p = this.players.find(player => player.email === email);

        const player = new Player();
        if (p) {
            //Create player using the raw data
            player.firstName = p.firstName;
            player.lastName = p.lastName;
            player.email = p.email;
            player.gender = p.gender || 'male';
            player.hi = p.hi;

            //Add calclated fields
            player.name = player.firstName + ' ' + player.lastName;

            //Set tees based on gender
            if (player.gender === 'male') {
                player.tees = this.course.male.white;
            } else {
                player.tees = this.course.female.gold;
            }

            //Set playing handicap
            if (ph) {
                player.ph = ph;
            } else if (player.hi) {
                player.ph = Math.round((player.hi * player.tees.sr / 113 + (player.tees.cr - player.tees.parTotal)) * 0.95);
            }
            else {
                player.ph = 0;
            }

            //Check if this player is an admin
            player.admin = this.admins.includes(email);

            //Calculate how many shots are given on each hole for this player
            player.shots = new Array(18).fill(0);

            const base = Math.trunc(player.ph/18);   // Get this many shots for all holes
            const modulo = player.ph % 18;           // Get 1 extra shot on holes with si up to and includiong "modulo"
            for (let i = 0; i < 18; i++) {
                const si = player.tees.si[i];
                if (modulo >= si) {
                    player.shots[i] = base + 1;
                } else {
                    player.shots[i] = base;
                }
            }
        }
        return player;
    }
}

export const data = new Data();
    