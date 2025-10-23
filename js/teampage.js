//Logic for the team definition page

'use strict';

import { data } from './data.js';
import { pageNavigator } from './pageNavigator.js';
import { scoreEntryPage } from './scoreEntryPage.js';
import { Competition } from './schema.js';


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
        this.teamHandicap = document.getElementById('teamHandicap');
        this.teamHandicapValue = document.getElementById('teamHandicapValue');
        this.teamNextBtn = document.getElementById('teamNextBtn');
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

        if (comp.isTeamHandicap()) {
            this.teamHandicap.style.display = 'block';

            this.teamPhA.disabled = true;
            this.teamPhB.disabled = true;
            this.teamPhC.disabled = true;
            this.teamPhD.disabled = true;
        } else {
            this.teamHandicap.style.display = 'none';

            this.teamNameA.value = pageNavigator.player.name;
            this.teamPhA.value = pageNavigator.player.ph;
        }
    }

    wireEvents() {
        this.teamNextBtn.addEventListener('click', () => this.onNextBtnClick());
        this.teamNameA.addEventListener('input', (e) => this.onNameChange(e));
        this.teamNameB.addEventListener('input', (e) => this.onNameChange(e));
        this.teamNameC.addEventListener('input', (e) => this.onNameChange(e));
        this.teamNameD.addEventListener('input', (e) => this.onNameChange(e));
    }

    onNextBtnClick() {
        pageNavigator.showPage('review');
    }

    onNameChange(e) {
        if (e.inputType.startsWith('insert')) {
            const name = e.target.value;
            const p = data.findPlayer(name);
            if (p) {
                const player = data.getPlayer(p.email);
                e.target.value = player.name;
            }
        }
    }

    init() {
        this.wireEvents();
        this.renderHeader();
        this.renderPlayers();
    }
}

export const teamPage = new TeamPage();
