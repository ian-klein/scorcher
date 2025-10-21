//The review scores screen

'use strict';

import { pageNavigator } from './pageNavigator.js';
import { backend } from './backend.js';
import { data } from './data.js';

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

        this.holeControls = document.querySelectorAll('.hole-num');
        this.scoreControls = document.querySelectorAll('.score-val');
        this.pointsControls = document.querySelectorAll('.pts-val');

        this.scoreSubmitted = document.getElementById('scoreSubmitted');

        this.wireEvents();
    }        

    wireEvents() {
        this.backBtn.addEventListener('click', () => this.onBackBtnClick());
        this.submitBtn.addEventListener('click', () => this.onSubmitBtnClick());
    }

    onBackBtnClick() {
        pageNavigator.showPage('scoreEntry');
    }

    async onSubmitBtnClick() {
        const isAnyGrossScoreNull = pageNavigator.scores.gross.some(score => score === null);

        if (isAnyGrossScoreNull) {
            alert('Please enter all scores before submitting');
            return;
        }

        backend.showSpinner();
        const isSubmitSuccess = await backend.submitScores(pageNavigator.competition, pageNavigator.player, pageNavigator.scores);
        backend.hideSpinner();

        this.renderSubmitButton(isSubmitSuccess);
    }

    renderHeader() {
        this.competitionName.textContent = data.competitionDisplayName(pageNavigator.competition);
        this.competitionDate.textContent = pageNavigator.competition.date.toLocaleDateString('en-GB');
        this.playerName.textContent = pageNavigator.player.name;
        this.handicapIndex.textContent = pageNavigator.player.hi;
        this.playingHandicap.textContent = pageNavigator.player.ph;
    }

    renderScores() {
        if (pageNavigator.competition.type === CompetitionType.STABLEFORD) {
            this.renderStablefordScores();
        } else if (pageNavigator.competition.type === CompetitionType.STROKEPLAY) {
            this.renderStrokeplayScores();
        }
    }

    renderStablefordScores() {
        this.scoreControls.forEach((control, index) => {
            control.textContent = pageNavigator.scores.gross[index];
        });

        const outScoreTotal = pageNavigator.scores.adjusted.slice(0, 9).reduce((total, value) => total + value, 0);
        const backScoreTotal = pageNavigator.scores.adjusted.slice(9).reduce((total, value) => total + value, 0);
        const overallScoreTotal = outScoreTotal + backScoreTotal;
        const nettScoreTotal = overallScoreTotal - pageNavigator.player.ph;

        let star = '';
        for (let i = 0; i < 18; i++) {
            const adjusted = pageNavigator.scores.adjusted[i]?.toString();
            const gross = pageNavigator.scores.gross[i]?.toString();
            if (!adjusted || !gross || adjusted !== gross) {
                star = '*';
                break;
            }
        }
    
        this.outScoreTotal.textContent = outScoreTotal + star;
        this.backScoreTotal.textContent = backScoreTotal + star;
        this.overallScoreTotal.textContent = overallScoreTotal + star;
        this.nettScoreTotal.textContent = nettScoreTotal + star;

        this.pointsControls.forEach((control, index) => {
            control.textContent = pageNavigator.scores.points[index];
        });

        const outPointsTotal = pageNavigator.scores.points.slice(0, 9).reduce((total, value) => total + value, 0);
        const backPointsTotal = pageNavigator.scores.points.slice(9).reduce((total, value) => total + value, 0);
        const overallPointsTotal = outPointsTotal + backPointsTotal;

        this.outPointsTotal.textContent = outPointsTotal;
        this.backPointsTotal.textContent = backPointsTotal;
        this.overallPointsTotal.textContent = overallPointsTotal;    
    }

    renderStrokeplayScores() {
        this.scoreControls.forEach((control, index) => {
            control.textContent = pageNavigator.scores.gross[index];
        });

        let outScoreTotal = 0;
        let backScoreTotal = 0;
        let noReturn = false;
        for (let i = 0; i < 18; i++) {
            const score = pageNavigator.scores.gross[i];
            if (!score || score === '' || score === 'X' || score === '0') {
                noReturn = true;
            }
            else {
                if (i < 9) {
                    outScoreTotal += parseInt(score);
                }
                else {
                    backScoreTotal += parseInt(score);
                }
            }
        }
        const overallScoreTotal = outScoreTotal + backScoreTotal;
        const nettScoreTotal = overallScoreTotal - pageNavigator.player.ph;

        if (noReturn) {
            this.outScoreTotal.textContent = 'X';
            this.backScoreTotal.textContent = 'X';
            this.overallScoreTotal.textContent = 'X';
            this.nettScoreTotal.textContent = 'X';
        } else {
            this.outScoreTotal.textContent = outScoreTotal;
            this.backScoreTotal.textContent = backScoreTotal;
            this.overallScoreTotal.textContent = overallScoreTotal;
            this.nettScoreTotal.textContent = nettScoreTotal;
        }
        
        //Clear all the points - not used for strokeplay
        this.pointsControls.forEach((control, index) => {
            control.textContent = '';
        });
        this.outPointsTotal.textContent = '';
        this.backPointsTotal.textContent = '';
        this.overallPointsTotal.textContent = '';
    }

    renderHoleNumbers() {
        this.holeControls.forEach((control, index) => {
            control.textContent = (index + 1).toString() + '(' + pageNavigator.player.tees.par[index] + ')';
        });
    }
   
    async renderSubmitButton(isOnSubmit) {
        if (isOnSubmit) {
            this.submitBtn.disabled = true;
            this.scoreSubmitted.style.display = 'block';
        } else {
            this.submitBtn.disabled = false;
            this.scoreSubmitted.style.display = 'none';

            backend.showSpinner();
            const scores = await backend.getScores(pageNavigator.competition, pageNavigator.player);
            backend.hideSpinner();
            
            if (scores) {
                for (let i = 0; i < 18; i++) {
                    if (scores.gross[i] !== pageNavigator.scores.gross[i]) {
                        return;
                    }
                }

                //Scores are the same - all good
                this.submitBtn.disabled = true;
                this.scoreSubmitted.style.display = 'block';
            }
        }
    }
    init() {
        this.renderHeader();
        this.renderHoleNumbers();
        this.renderScores();
        this.renderSubmitButton(false);
    }
}

export const reviewPage = new ReviewPage();