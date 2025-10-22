//Logic for the team definition page

'use strict';

import { data } from './data.js';
import { pageNavigator } from './pageNavigator.js';
import { scoreEntryPage } from './scoreEntryPage.js';
import { CompetitionType } from './schema.js';


class TeamPage {
    constructor() {
        this.teamCompetitionName = document.getElementById('teamCompetitionName');
        this.teamCompetitionDate = document.getElementById('teamCompetitionDate');
        this.teamPlayerA = document.getElementById('teamPlayerA');
        this.teamPhA = document.getElementById('teamPhA');
        this.teamPlayerB = document.getElementById('teamPlayerB');
        this.teamPhB = document.getElementById('teamPhB');
        this.teamPlayerC = document.getElementById('teamPlayerC');
        this.teamPhC = document.getElementById('teamPhC');
        this.teamPlayerD = document.getElementById('teamPlayerD');
        this.teamPhD = document.getElementById('teamPhD');
        this.teamHandicapValue = document.getElementById('teamHandicapValue');
        this.teamNextBtn = document.getElementById('teamNextBtn');
    }

    init() {

    }
}

export const teamPage = new TeamPage();
