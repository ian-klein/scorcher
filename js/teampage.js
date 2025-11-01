//Logic for the team definition page

'use strict';

import { data } from './data.js';
import { pageNavigator } from './pageNavigator.js';
import { scoreEntryPage } from './scoreEntryPage.js';
import { Competition, Player } from './schema.js';

const SAVED_TEAM_KEY = 'team_v1';

class TeamPage {
    constructor() {
        this.teamCompetitionName = document.getElementById('teamCompetitionName');
        this.teamCompetitionDate = document.getElementById('teamCompetitionDate');
        this.teamPlayerA = document.getElementById('teamPlayerA');
        this.teamNameA = document.getElementById('teamNameA');
        this.teamPhA = document.getElementById('teamPhA');
        this.teamPlayerB = document.getElementById('teamPlayerB');
        this.teamNameB = document.getElementById('teamNameB');
        this.teamPhB = document.getElementById('teamPhB');
        this.teamPlayerC = document.getElementById('teamPlayerC');
        this.teamNameC = document.getElementById('teamNameC');
        this.teamPhC = document.getElementById('teamPhC');
        this.teamPlayerD = document.getElementById('teamPlayerD');
        this.teamNameD = document.getElementById('teamNameD');
        this.teamPhD = document.getElementById('teamPhD');

        this.teamPlayers = [
            { name: this.teamNameA, ph: this.teamPhA },
            { name: this.teamNameB, ph: this.teamPhB },
            { name: this.teamNameC, ph: this.teamPhC },
            { name: this.teamNameD, ph: this.teamPhD }
        ];

        this.teamHandicap = document.getElementById('teamHandicap');
        this.teamHandicapValue = document.getElementById('teamHandicapValue');

        this.teamPhLabels = document.querySelectorAll('.team-ph-label');
        this.teamPhInputs = document.querySelectorAll('.team-ph');

        this.teamNextBtn = document.getElementById('teamNextBtn');
        this.teamBackBtn = document.getElementById('teamBackBtn');

        this.players = [];
        this.th = null;
        this.wireEvents();
    }

    wireEvents() {
        this.teamNextBtn.addEventListener('click', () => this.onNextBtnClick());
        this.teamBackBtn.addEventListener('click', () => this.onBackBtnClick());

        this.teamNameA.addEventListener('input', (e) => this.onNameInput(e,0));
        this.teamNameB.addEventListener('input', (e) => this.onNameInput(e,1));
        this.teamNameC.addEventListener('input', (e) => this.onNameInput(e,2));
        this.teamNameD.addEventListener('input', (e) => this.onNameInput(e,3));

        this.teamPhA.addEventListener('input', (e) => this.onPhInput(e,0));
        this.teamPhB.addEventListener('input', (e) => this.onPhInput(e,1));
        this.teamPhC.addEventListener('input', (e) => this.onPhInput(e,2));
        this.teamPhD.addEventListener('input', (e) => this.onPhInput(e,3));

        this.teamHandicapValue.addEventListener('input', () => this.onTeamHandicapValueInput());        
    }

    renderHeader() {
        this.teamCompetitionName.textContent = data.competitionDisplayName(pageNavigator.competition);
        this.teamCompetitionDate.textContent = pageNavigator.competition.date.toLocaleDateString('en-GB');
    }

    renderPlayers() {
        const comp = pageNavigator.competition;
        const teamSize = comp.teamSize();

        if (teamSize > 2) {
            this.teamPlayerC.style.display = 'flex';
        } else {
            this.teamPlayerC.style.display = 'none';
        }

        if (teamSize > 3) {
            this.teamPlayerD.style.display = 'flex';
        } else {
            this.teamPlayerD.style.display = 'none';
        }

        if (comp.numberOfScores() == 1) {
            this.teamPhLabels.forEach(label => label.style.display = 'none');
            this.teamPhInputs.forEach(input => input.style.display = 'none');
            this.teamHandicap.style.display = 'block';
            this.teamHandicapValue.value = this.th;
        } else {
            this.teamPhLabels.forEach(label => label.style.display = 'block');
            this.teamPhInputs.forEach(input => input.style.display = 'block');
            this.teamHandicap.style.display = 'none';
        }

        for (let i = 0; i < teamSize; i++) {
            if (this.players[i]) {
                this.teamPlayers[i].name.value = this.players[i].name;
                this.teamPlayers[i].ph.value = this.players[i].ph;
            }
        }
    }

    renderContinueButton() {
        if (this.players.some(p => !p) || this.players.some(p => !p.name || p.name.length ===0)) {
            this.teamNextBtn.disabled = true;
        }
        else {
            const numberOfScores = pageNavigator.competition.numberOfScores();

            if (numberOfScores == 1) {
                const teamHandicap = this.teamHandicapValue.value?.trim();
                this.teamNextBtn.disabled = !teamHandicap || teamHandicap.length === 0;
            }
            else {
                this.teamNextBtn.disabled = this.players.some(p => !p.ph || p.ph.length === 0);
            }
        }
    }

    onNextBtnClick() {
        this.saveTeam();

        const comp = pageNavigator.competition;
        const numberOfScores = comp.numberOfScores();

        /*
         * The number of scores dictates how the team is represented. For team games with a single score
         * like a scramble, the team is represented by a single player whose name is a concatenation of the
         * team members. For team games with multiple scores, the team is represented by a player for each score.
         */
        if (numberOfScores == 1) {
            const teamPlayer = data.getTeamPlayer(comp, this.players, this.th);
            pageNavigator.players = [ teamPlayer ];
        }
        else {
            pageNavigator.players = this.players;
        }
        scoreEntryPage.init();
        pageNavigator.showPage('scoreEntry');
    }

    onBackBtnClick() {
        pageNavigator.showPage("splash");
    }

    onNameInput(e,index) {
        if (e.inputType.startsWith('insert')) {
            if (this.players[index]) {
                if (e.target.value.startsWith(this.players[index].name)) {
                    e.target.value = this.players[index].name;
                }
            }
            else {
                const name = e.target.value;
                const player = data.findPlayer(name);
                if (player) {
                    e.target.value = player.name;
                    this.players[index] = player;
                    this.renderContinueButton();
                }
            }
        }
        else {
            this.players[index] = null;
            this.renderContinueButton();
        }
    }

    onPhInput(e,index) {
        this.players[index].ph = Number(e.target.value);
        this.renderContinueButton();
    }

    onTeamHandicapValueInput() {
        this.th = Number(this.teamHandicapValue.value?.trim());
        this.renderContinueButton();
    }

    saveTeam() {
        const savedTeam = {
            competition: pageNavigator.competition,
            players: this.players,
            th: this.th
        };
        localStorage.setItem(SAVED_TEAM_KEY, JSON.stringify(savedTeam));
    }

    savedTeamReviver(key, value) {
        if (key === 'competition') {
            return new Competition(value);
        }
        else if (key === 'players') {
            return value.map(p => new Player(p));
        }
        else {
            return value;
        }
    }
    
    loadTeam() {
        const comp = pageNavigator.competition;
        this.players = new Array(comp.teamSize()).fill(null);

        //Initialze the first player from the splash screen
        this.teamNameA.value = pageNavigator.players[0].name;
        this.teamPhA.value = pageNavigator.players[0].ph;
        this.players[0] = pageNavigator.players[0];

        const rawTeam = localStorage.getItem(SAVED_TEAM_KEY);
        if (rawTeam) {
            const savedTeam = JSON.parse(rawTeam, this.savedTeamReviver);

            if (savedTeam.competition.type === comp.type && savedTeam.competition.date.toISOString().slice(0, 10) === comp.date.toISOString().slice(0, 10)) {
                this.players = savedTeam.players;
                this.th = savedTeam.th;
            }
        }
    }

    init() {
        this.loadTeam();
        this.renderHeader();
        this.renderPlayers();
        this.renderContinueButton();
    }
}

export const teamPage = new TeamPage();
