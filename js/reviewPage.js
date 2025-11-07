//The review scores screen

'use strict';

import { pageNavigator } from './pageNavigator.js';
import { backend } from './backend.js';
import { data } from './data.js';
import { Competition } from './schema.js';
import { ui } from './ui.js';

class ReviewPage {
    constructor() {
        this.competitionName = document.getElementById('reviewCompetitionName');
        this.competitionDate = document.getElementById('reviewCompetitionDate');
        
        this.playerHeader = [    
            {label: document.getElementById('reviewPlayerLabelA'), name: document.getElementById('reviewPlayerNameA'), ph: document.getElementById('reviewPlayerPhA')},
            {label: document.getElementById('reviewPlayerLabelB'), name: document.getElementById('reviewPlayerNameB'), ph: document.getElementById('reviewPlayerPhB')},
            {label: document.getElementById('reviewPlayerLabelC'), name: document.getElementById('reviewPlayerNameC'), ph: document.getElementById('reviewPlayerPhC')},
            {label: document.getElementById('reviewPlayerLabelD'), name: document.getElementById('reviewPlayerNameD'), ph: document.getElementById('reviewPlayerPhD')}
        ];

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

        this.scoreHeaderOut = document.getElementById('scoreHeaderOut');
        this.scoreHeaderBack = document.getElementById('scoreHeaderBack');
        this.ptsHeaderOut = document.getElementById('ptsHeaderOut');
        this.ptsHeaderBack = document.getElementById('ptsHeaderBack');

        this.scoreSubmitted = document.getElementById('scoreSubmitted');

        this.wireEvents();
    }        

    wireEvents() {
        this.backBtn.addEventListener('click', () => this.onBackBtnClick());
        this.submitBtn.addEventListener('click', () => this.onSubmitBtnClick());
    }

    onBackBtnClick() {
        pageNavigator.back();
    }

    async onSubmitBtnClick() {
        const { errorMsg, warningMsg } = pageNavigator.scorecard.validate();
        if (errorMsg) {
            alert(errorMsg);
            return;
        }

        if (warningMsg) {
            alert(warningMsg);
        }
 
        backend.showSpinner();
        const isSubmitSuccess = await backend.submitScorecard(pageNavigator.scorecard);
        backend.hideSpinner();

        this.renderSubmitButton(isSubmitSuccess);
    }

    setScoreGridStyle(element) {
        const comp = pageNavigator.scorecard.competition;
        element.classList.remove('multi-score-2', 'mulit-score-3');
        if (comp.numberOfScores() === 2) {
            element.classList.add('multi-score-2');
        } else if (comp.numberOfScores() === 3) {
            element.classList.add('mulit-score-3');
        } else if (comp.type === Competition.Type.SCRAMBLE) {
            element.classList.add('multi-score-2');
        }
    }

    renderScoreHeading(scoreHeader) {
        const comp = pageNavigator.scorecard.competition;
        this.setScoreGridStyle(scoreHeader);
        if (comp.numberOfScores() === 1) {
            scoreHeader.textContent = 'Score';
        } else {
            const headers = ['A', 'B', 'C', 'D'].slice(0, comp.numberOfScores());
            const headerHtml = headers.map(header => `<span>${header}</span>`).join('');
            scoreHeader.innerHTML = headerHtml;
        }
    }

    setPointsGridStyle(element) {
        const comp = pageNavigator.scorecard.competition;
        element.classList.remove('mulit-score-3');
        if (comp.type === Competition.Type.AKQ) {
            element.classList.add('mulit-score-3');
        }
    }

    renderPointsHeading(ptsHeader) {
        const comp = pageNavigator.scorecard.competition;
        this.setPointsGridStyle(ptsHeader);
        if (comp.type === Competition.Type.AKQ) {
            ptsHeader.innerHTML = '<span></span><span>Pts</span><span></span>';
        } else {
            ptsHeader.textContent = 'Pts';
        }
    }

    renderHeader() {
        this.competitionName.textContent = data.competitionDisplayName(pageNavigator.scorecard.competition);
        this.competitionDate.textContent = new Date(pageNavigator.scorecard.competition.date).toLocaleDateString('en-GB');

        ui.renderPlayerHeader(pageNavigator.scorecard.players, this.playerHeader);

        this.renderScoreHeading(this.scoreHeaderOut);
        this.renderScoreHeading(this.scoreHeaderBack);

        this.renderPointsHeading(this.ptsHeaderOut);
        this.renderPointsHeading(this.ptsHeaderBack);
    }

    renderScores() {
        const comp = pageNavigator.scorecard.competition;

        //Calculate the team points for team comps
        if (comp.numberOfScores() > 1) {
            const scores = pageNavigator.scorecard.scores;

            for (let h = 0; h < 18; h++)
            {
                pageNavigator.scorecard.points[h] = 0;
                for (let i = 0; i < comp.numberOfScores(); i++) {
                    pageNavigator.scorecard.points[h] += scores[i].points[h];
                }

                if (comp.type === Competition.Type.YELLOWBALL) {
                    const lostYellowBall = pageNavigator.scorecard.lostYellowBall;
                    if (!lostYellowBall || h + 1 < lostYellowBall) {
                        const yellowBallIndex = h % 3;
                        pageNavigator.scorecard.points[h] += scores[yellowBallIndex].points[h];
                    }
                }
            }
        }

        if (comp.scoring() === Competition.Type.STABLEFORD) {
            this.renderStablefordScores();
        } else if (comp.scoring() === Competition.Type.STROKEPLAY) {
            this.renderStrokeplayScores();
        }
    }

    renderStablefordScores() {
        const comp = pageNavigator.scorecard.competition;
        const scores = pageNavigator.scorecard.scores;

        //Display gross scores for each hole
        this.scoreControls.forEach((control, index) => {
            this.setScoreGridStyle(control);
            if (comp.numberOfScores() === 1) {
                control.textContent = scores[0].gross[index];
            }
            else {
                const backgroundColor = [ 'white', 'white', 'white' ];
                if (comp.type === Competition.Type.YELLOWBALL) {
                    const lostYellowBall = pageNavigator.scorecard.lostYellowBall;
                    if (!lostYellowBall || index + 1 < lostYellowBall) {
                        const yellowBallIndex = index % 3;
                        backgroundColor[yellowBallIndex] = 'yellow';
                    }
                }
                const scoreHtml = scores.map((score, si) => `<span style="background-color: ${backgroundColor[si]}">${score.gross[index] || ''}</span>`).join('')
                control.innerHTML = scoreHtml;
            }
        });

        if (comp.numberOfScores() === 1) {
            const outScoreTotal = pageNavigator.scorecard.scores[0].adjusted.slice(0, 9).reduce((total, value) => total + value, 0);
            const backScoreTotal = pageNavigator.scorecard.scores[0].adjusted.slice(9).reduce((total, value) => total + value, 0);
            const overallScoreTotal = outScoreTotal + backScoreTotal;
            const nettScoreTotal = overallScoreTotal - pageNavigator.scorecard.players[0].ph;

            let star = '';
            for (let i = 0; i < 18; i++) {
                const adjusted = pageNavigator.scorecard.scores[0].adjusted[i]?.toString();
                const gross = pageNavigator.scorecard.scores[0].gross[i]?.toString();
                if (!adjusted || !gross || adjusted !== gross) {
                    star = '*';
                    break;
                }
            }
        
            this.outScoreTotal.textContent = outScoreTotal + star;
            this.backScoreTotal.textContent = backScoreTotal + star;
            this.overallScoreTotal.textContent = overallScoreTotal + star;
            this.nettScoreTotal.textContent = nettScoreTotal + star;
        } else {
            this.outScoreTotal.textContent = '';
            this.backScoreTotal.textContent = '';
            this.overallScoreTotal.textContent = '';
            this.nettScoreTotal.textContent = '';
        }

        //Display points for each hole
        const points = comp.numberOfScores() === 1 ? pageNavigator.scorecard.scores[0].points : pageNavigator.scorecard.points;
        this.pointsControls.forEach((control, index) => {
            this.setPointsGridStyle(control);
            if (comp.type === Competition.Type.AKQ) {
                let courtCard = '';
                if (index + 1 === pageNavigator.scorecard.players[0].akq.ace) {
                    courtCard += 'A';
                }
                if (index + 1 === pageNavigator.scorecard.players[0].akq.king) {
                    courtCard += 'K';
                }
                if (index + 1 === pageNavigator.scorecard.players[0].akq.queen) {
                    courtCard += 'Q';
                }
                const ptsHtml = `<span></span><span>${points[index]}</span><span>${courtCard}</span>`;
                control.innerHTML = ptsHtml;
            } else {
                control.textContent = points[index];
            }
        });

        const outPointsTotal = points.slice(0, 9).reduce((total, value) => total + value, 0);
        const backPointsTotal = points.slice(9).reduce((total, value) => total + value, 0);
        const overallPointsTotal = outPointsTotal + backPointsTotal;

        this.outPointsTotal.textContent = outPointsTotal;
        this.backPointsTotal.textContent = backPointsTotal;
        this.overallPointsTotal.textContent = overallPointsTotal;    
    }

    renderStrokeplayScores() {
        const scores = pageNavigator.scorecard.scores;

        this.scoreControls.forEach((control, index) => {
            control.textContent = scores[0].gross[index];
        });

        let outScoreTotal = 0;
        let backScoreTotal = 0;
        let noReturn = false;
        for (let i = 0; i < 18; i++) {
            const score = scores[0].gross[i];
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
        const nettScoreTotal = overallScoreTotal - pageNavigator.scorecard.players[0].ph;

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

        const comp = pageNavigator.scorecard.competition;
        if (comp.type === Competition.Type.SCRAMBLE) {
            this.ptsHeaderOut.textContent = 'Tee';
            this.ptsHeaderBack.textContent = 'Tee';
            const teeShot = pageNavigator.scorecard.teeShot;

            this.pointsControls.forEach((control, index) => {
                control.textContent = teeShot[index];
            });
        }
        else {
            this.ptsHeaderOut.textContent = 'Pts';
            this.ptsHeaderBack.textContent = 'Pts';

            this.pointsControls.forEach((control, index) => {
                control.textContent = '';
            });
        }

        this.outPointsTotal.textContent = '';
        this.backPointsTotal.textContent = '';
        this.overallPointsTotal.textContent = '';
    }

    renderHoleNumbers() {
        this.holeControls.forEach((control, index) => {
            control.textContent = (index + 1).toString() + '(' + pageNavigator.scorecard.players[0].tees.par[index] + ')';
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
            const scorecard = await backend.getScorecard(pageNavigator.scorecard.competition, pageNavigator.scorecard.id);
            backend.hideSpinner();
            
            if (scorecard && scorecard.scores.length == pageNavigator.scorecard.scores.length) {
                for (let h = 0; h < 18; h++) {
                    for (let s = 0; s < scorecard.scores.length; s++)
                    if (scorecard.scores[s].gross[h] !== pageNavigator.scorecard.scores[s].gross[h]) {
                        return;
                    }
                }

                const comp = pageNavigator.scorecard.competition;
                if (comp.type === Competition.Type.SCRAMBLE) {
                    for (let h = 0; h < 18; h++) {
                        if (scorecard.teeShot[h] !== pageNavigator.scorecard.teeShot[h]) {
                            return;
                        }
                    }
                }

                if (comp.type === Competition.Type.FLAG) {
                    if (scorecard.flag !== pageNavigator.scorecard.flag) {
                        return;
                    }
                }

                if (comp.type === Competition.Type.YELLOWBALL) {
                    if (scorecard.lostYellowBall !== pageNavigator.scorecard.lostYellowBall) {
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