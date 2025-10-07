//The review scores screen

'use strict';

import { pageNavigator } from './pageNavigator.js';
import { course } from './data.js'

class ReviewPage {
    constructor() {
        this.competitionName = document.getElementById('reviewCompetitionName');
        this.competitionDate = document.getElementById('reviewCompetitionDate');
        this.playerName = document.getElementById('reviewPlayerName');
        this.handicapIndex = document.getElementById('reviewHandicapIndex');
        this.playingHandicap = document.getElementById('reviewPlayingHandicap');
        this.backBtn = document.getElementById('backBtn');
        this.submitBtn = document.getElementById('submitBtn');

        this.outScoreTotal = document.getElementById('out-score-total');
        this.backScoreTotal = document.getElementById('back-score-total');
        this.overallScoreTotal = document.getElementById('overall-score-total');
        this.nettScoreTotal = document.getElementById('nett-score-total');

        this.outPointsTotal = document.getElementById('out-pts-total');
        this.backPointsTotal = document.getElementById('back-pts-total');
        this.overallPointsTotal = document.getElementById('overall-pts-total');

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

        this.pointsControls.forEach((control, index) => {
            control.textContent = pageNavigator.scores.points[index];
        });

        const outScoreTotal = pageNavigator.scores.adjusted.slice(0, 9).reduce((total, value) => total + value, 0);
        const backScoreTotal = pageNavigator.scores.adjusted.slice(9).reduce((total, value) => total + value, 0);
        const overallScoreTotal = outScoreTotal + backScoreTotal;
        const nettScoreTotal = overallScoreTotal - pageNavigator.player.ph;

        let star = '';
        for (let i = 0; i < 18; i++) {
            if (pageNavigator.scores.adjusted[i].toString() !== pageNavigator.scores.gross[i].toString()) {
                star = '*';
                break;
            }
        }
    
        this.outScoreTotal.textContent = outScoreTotal + star;
        this.backScoreTotal.textContent = backScoreTotal + star;
        this.overallScoreTotal.textContent = overallScoreTotal + star;
        this.nettScoreTotal.textContent = nettScoreTotal + star;

        const outPointsTotal = pageNavigator.scores.points.slice(0, 9).reduce((total, value) => total + value, 0);
        const backPointsTotal = pageNavigator.scores.points.slice(9).reduce((total, value) => total + value, 0);
        const overallPointsTotal = outPointsTotal + backPointsTotal;

        this.outPointsTotal.textContent = outPointsTotal;
        this.backPointsTotal.textContent = backPointsTotal;
        this.overallPointsTotal.textContent = overallPointsTotal;    
    }
   
    init() {
        this.renderHeader();
        this.renderScores();
    }
}

export const reviewPage = new ReviewPage();