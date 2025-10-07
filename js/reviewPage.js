//The review scores screen

'use strict';

import { pageNavigator } from './page-navigator.js';

class ReviewPage {
    constructor() {
        this.competitionName = document.getElementById('reviewCompetitionName');
        this.competitionDate = document.getElementById('reviewCompetitionDate');
        this.playerName = document.getElementById('reviewPlayerName');
        this.handicapIndex = document.getElementById('reviewHandicapIndex');
        this.playingHandicap = document.getElementById('reviewPlayingHandicap');
        this.backBtn = document.getElementById('backBtn');
        this.submitBtn = document.getElementById('submitBtn');

        //Get an arry of all 18 scores controls
        this.scoreControls = document.querySelectorAll('.score-val');
        this.pointsControls = document.querySelectorAll('.pts-val');

        this.wireEvents();
    }        

    wireEvents() {
        this.backBtn.addEventListener('click', () => this.onBackBtnClick());
        this.submitBtn.addEventListener('click', () => this.onSubmitBtnClick());
    }

    onBackBtnClick() {
        pageNavigator.showPage('scoreEntry');
    }

    onSubmitBtnClick() {
        alert("Not implemented yet")
    }

    renderHeader() {
        this.competitionName.textContent = pageNavigator.competition.name;
        this.competitionDate.textContent = pageNavigator.competition.date;
        this.playerName.textContent = pageNavigator.player.name;
        this.handicapIndex.textContent = pageNavigator.player.hi;
        this.playingHandicap.textContent = pageNavigator.player.ph;
    }

    renderScores() {
        this.scoreControls.forEach((control, index) => {
            control.textContent = pageNavigator.scores.gross[index];
        });
    }
    
    init() {
        this.renderHeader();
        this.renderScores();
    }

}

export const reviewPage = new ReviewPage();