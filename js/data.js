//Functions related to the data used by the application

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

    #fullName(p) {
        return p.firstName + ' ' + p.lastName;
    }

    getCompetition(date) {
        const eventDate = date || new Date();
        const event = this.eventDiary.findLast(c => c.date.toISOString().slice(0, 10) <= eventDate.toISOString().slice(0, 10));

        const comp = new Competition(event);
        return comp;
    }

    competitionDisplayName(c) {
        const day = c.date.getDate().toString().padStart(2, '0');
        const month = (c.date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}/${month} Millers ${c.name}`;
    }

    #getShots(tees, ph) {
        const base = Math.trunc(ph/18);   // Get this many shots for all holes
        const modulo = ph % 18;           // Get 1 extra shot on holes with si up to and includiong "modulo"

        const shots = new Array(18).fill(0);
        for (let i = 0; i < 18; i++) {
            const si = tees.si[i];
            if (modulo >= si) {
                shots[i] = base + 1;
            } else {
                shots[i] = base;
            }
        }
        return shots;
    }

    getPlayer(email, ph) {
        const p = this.players.find(player => player.email === email);

        const player = new Player(p);
        if (p) {
            player.name = this.#fullName(p);

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
            player.shots = this.#getShots(player.tees, player.ph);
        }
        return player;
    }

    getTeamPlayer(comp, players, th) { //TODO Comp is required if th is not given but hi is.
        const teamPlayer = new Player();

        teamPlayer.team = players;
        teamPlayer.name = players.map(p => p.lastName).join(' ');
        teamPlayer.ph = th;

        if (players.every(p => p.gender === 'female')) {
            teamPlayer.tees = this.course.female.gold;
        } else {
            teamPlayer.tees = this.course.male.white;
        }

        teamPlayer.shots = this.#getShots(teamPlayer.tees, th);
        return teamPlayer;
    }

    findPlayer(prefix) {
        const matches = this.players.filter(p => this.#fullName(p).toLowerCase().startsWith(prefix.toLowerCase()));
        if (matches.length === 1) {
            return this.getPlayer(matches[0].email);
        } else {
            return null;
        }
    }
}

export const data = new Data();
    