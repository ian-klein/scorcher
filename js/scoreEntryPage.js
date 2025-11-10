//Manages the score entry page interactions

'use strict';

import { pageNavigator } from './pageNavigator.js';
import { reviewPage } from './reviewPage.js'
import { Competition, Scorecard, Score } from './schema.js';
import { data } from './data.js';
import { ui } from './ui.js';

const SAVED_SCORES_KEY = 'saved_scores_v3';

const ScoreEntryMethod = Object.freeze({
    BASIC:      'basic',                    //Individual, single score
    SCRAMBLE:   Competition.Type.SCRAMBLE,  //Adds tee-shot dropdown
    FLAG:       Competition.Type.FLAG,      //Adds flag dropdown
    WALTZ:      Competition.Type.WALTZ,     //1,2,3 scores
    YELLOWBALL: Competition.Type.YELLOWBALL,//All 3 scores, with lost ball checkbox
    FOURBALL:   Competition.Type.FOURBALL   //1 of 2 scores
});

const STYLE_SUFFIX = '-score-grid';  //Suffix for the grid styles defined in styles.css

class ScoreEntryPage {
    constructor() {
        // DOM elements
        // Header elements
        this.competitionName = document.getElementById('competitionName');
        this.competitionDate = document.getElementById('competitionDate');

        this.playerHeader = [    
            {label: document.getElementById('scorePlayerLabelA'), name: document.getElementById('scorePlayerNameA'), ph: document.getElementById('scorePlayerPhA')},
            {label: document.getElementById('scorePlayerLabelB'), name: document.getElementById('scorePlayerNameB'), ph: document.getElementById('scorePlayerPhB')},
            {label: document.getElementById('scorePlayerLabelC'), name: document.getElementById('scorePlayerNameC'), ph: document.getElementById('scorePlayerPhC')},
            {label: document.getElementById('scorePlayerLabelD'), name: document.getElementById('scorePlayerNameD'), ph: document.getElementById('scorePlayerPhD')}
        ];
        
        // Hole elements
        this.holeSection = document.getElementById('holeSection');
        this.holeNumber = document.getElementById('holeNumber');
        this.priorHoleNumber = document.getElementById('priorHoleNumber');
        this.nextHoleNumber = document.getElementById('nextHoleNumber');
        this.priorScore = document.getElementById('priorScore');
        this.nextScore = document.getElementById('nextScore');
        this.scoreInputA = document.getElementById('scoreInputA');
        this.scoreInputB = document.getElementById('scoreInputB');
        this.scoreInputC = document.getElementById('scoreInputC');
        this.prevHole = document.getElementById('prevHole');
        this.nextHole = document.getElementById('nextHole');
        this.scoreEntrySelect = document.getElementById('scoreEntrySelect');
        this.scoreEntryLabel = document.getElementById('scoreEntryLabel');
        this.scoreGrid = document.getElementById('scoreGrid');
        this.lostYellowBallCheckbox = document.getElementById('lostYellowBallCheckbox');

        this.scoreInputArray = [
            this.scoreInputA,
            this.scoreInputB,
            this.scoreInputC
        ];
        
        // Keypad elements
        this.keypad = document.querySelector('.keypad');
        this.numberKeys = document.querySelectorAll('.number-key');
        this.specialKey = document.querySelector('.special-key');
        this.deleteKey = document.querySelector('.delete-key');
        
        // Action buttons
        this.reviewBtn = document.getElementById('reviewBtn');
        this.backBtn = document.getElementById('scoreEntryBackBtn');

        this.currentPlayer = 0;     //Index of the player scoring
        this.currentHole = 1;       //Current hole being scored
        this.scoreEntryMethod = null;

        this.wireEvents();
    }

    saveScorecard() {
        localStorage.setItem(SAVED_SCORES_KEY, JSON.stringify(pageNavigator.scorecard));
    }

    loadScorecard() {
        pageNavigator.scorecard = new Scorecard({competition: pageNavigator.scorecard.competition, players: pageNavigator.scorecard.players});

        const rawScorecard = localStorage.getItem(SAVED_SCORES_KEY);
        if (rawScorecard) {
            const scorecard = Scorecard.fromJSON(rawScorecard);
            if (scorecard.competition.type === pageNavigator.scorecard.competition.type && scorecard.competition.date === pageNavigator.scorecard.competition.date) {
                //Same date and type - reload scores for players that are in the page context
                for (let i = 0; i < scorecard.players.length; i++) {
                    const player = scorecard.players[i];
                    if (pageNavigator.scorecard.players.find(p => p.name === player.name)) {
                        pageNavigator.scorecard.scores[i] = scorecard.scores[i];
                    }
                }
                pageNavigator.scorecard.lostYellowBall = scorecard.lostYellowBall;
                pageNavigator.scorecard.flag = scorecard.flag;
                pageNavigator.scorecard.teeShot = scorecard.teeShot;
            }
        }
    }

    gridStyleFor(scoreEntryMethod) {
        if (scoreEntryMethod === ScoreEntryMethod.FLAG) {
            scoreEntryMethod = ScoreEntryMethod.SCRAMBLE; //TODO: Remove this when flag grid style is implemented
        }
        return scoreEntryMethod + STYLE_SUFFIX;
    }

    scoreEntryMethodFor(comp) {
        const method = Object.values(ScoreEntryMethod).find(m => m === comp.type);
        if (method) {
            return method;
        }
        else {
            return ScoreEntryMethod.BASIC;
        }
    }

    isFlagHole() {
        const player = pageNavigator.scorecard.players[this.currentPlayer];
        let shotsRemaining = Number(player.tees.parTotal) + Number(player.ph);
        let hole = 1;
        while (hole < this.currentHole && shotsRemaining > 0) {
            const gross = pageNavigator.scorecard.scores[this.currentPlayer].gross[hole - 1];
            if (!gross || gross === 'X') break;
            shotsRemaining -= Number(gross);
            hole++;
        }

        if (hole < this.currentHole) {
            //The shots ran out before this hole
            return false;
        }

        const par = player.tees.par[this.currentHole - 1];
        if (shotsRemaining > 0 && shotsRemaining <= par) {
            //The flag hole is this hole
            return true;
        }
        else {
            return false;
        }
    }
    

    wireEvents() {
        // Navigation arrows
        this.prevHole.addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateHole(-1);
        });
        this.nextHole.addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateHole(1);
        });
        
        // Keypad buttons
        this.keypad.addEventListener('click', (e) => {
            e.preventDefault();
            const btn = e.target.closest('.key-btn');
            if (!btn) return;
            
            const value = btn.dataset.value;
            this.handleKeypadInput(value);
        });
        
        // Action buttons
        this.reviewBtn.addEventListener('click', () => this.onReviewBtnClick());
        this.backBtn.addEventListener('click', () => this.onBackBtnClick());
        
        // Prevent score fields from being edited
        this.scoreInputA.addEventListener('keydown', (e) => {
            e.preventDefault();
        });
        this.scoreInputB.addEventListener('keydown', (e) => {
            e.preventDefault();
        });
        this.scoreInputC.addEventListener('keydown', (e) => {
            e.preventDefault();
        });

        this.scoreInputA.addEventListener('focus', (e) => this.onScoreInputFocus(e));
        this.scoreInputB.addEventListener('focus', (e) => this.onScoreInputFocus(e));
        this.scoreInputC.addEventListener('focus', (e) => this.onScoreInputFocus(e));

        this.lostYellowBallCheckbox.addEventListener('change', () => this.onLostYellowBallCheckboxChange());

        this.scoreEntrySelect.addEventListener('change', () => this.onScoreEntrySelectChange());
    }

    navigateHole(direction) {
        let newHole = this.currentHole + direction;
        
        if (newHole < 1) newHole = 18;
        if (newHole > 18) newHole = 1;
        
        this.currentHole = newHole;
        this.renderHoleScore();
    }

    handleKeypadInput(value) {
        let autoNavigate = this.scoreEntryMethod === ScoreEntryMethod.BASIC;
        const scoreInput = this.scoreInputArray[this.currentPlayer];
        const currentScore = scoreInput.value;
        
        if (value === 'DEL') {
            // Delete last character
            scoreInput.value = currentScore.slice(0, -1);
            autoNavigate = false;
        } else if (value === 'X') {
            // X typically means no score or not played
            scoreInput.value = 'X';
        } else if (value === '0' && currentScore === '') {
            // 0 typically means no score or not played
            scoreInput.value = 'X';
        } else {
            // Number key pressed
            if (currentScore === 'X' || currentScore === '') {
                // Set score as the number
                scoreInput.value = value;
                if (value === '1') {
                    autoNavigate = false;
                }
            } else if (currentScore === '1') {
                // Add digit (max 2 digits)
                scoreInput.value = currentScore + value;
            }
        }

        this.saveCurrentScore();

        //If the next hole is not yet scored, navigate to it
        if (autoNavigate && this.currentHole < 18 && !pageNavigator.scorecard.scores[0].gross[this.currentHole]) {
            this.navigateHole(1);
        }
    }

    saveCurrentScore() {
        const scoreInput = this.scoreInputArray[this.currentPlayer];
        const gross = scoreInput.value.trim();
        if (gross === '') {
            pageNavigator.scorecard.scores[this.currentPlayer].gross[this.currentHole - 1] = null;
        } else {
            pageNavigator.scorecard.scores[this.currentPlayer].gross[this.currentHole - 1] = gross;
        }

        pageNavigator.scorecard.scores[this.currentPlayer].points[this.currentHole - 1] = this.calculatePoints();
        pageNavigator.scorecard.scores[this.currentPlayer].adjusted[this.currentHole - 1] = this.calculateAdjusted();
        this.saveScorecard();
    }

    calculatePoints() {
        const gross = pageNavigator.scorecard.scores[this.currentPlayer].gross[this.currentHole - 1];

        if (!gross || gross === 'X' || gross === '' || gross === 0) {
            return 0;
        } else {
            const par = pageNavigator.scorecard.players[this.currentPlayer].tees.par[this.currentHole - 1];
            const nett = gross - pageNavigator.scorecard.players[this.currentPlayer].shots[this.currentHole - 1];

            let points = Math.max(0,  par-nett + 2);

            if (pageNavigator.scorecard.competition.type === Competition.Type.AKQ) {
                if (this.currentHole == pageNavigator.scorecard.players[this.currentPlayer].akq.ace) {
                    points = points * 4;
                }
                if (this.currentHole == pageNavigator.scorecard.players[this.currentPlayer].akq.king) {
                    points = points * 3;
                }
                if (this.currentHole == pageNavigator.scorecard.players[this.currentPlayer].akq.queen) {
                    points = points * 2;
                }
            }


            return points;
        }
    }
    
    calculateAdjusted() {
        const gross = pageNavigator.scorecard.scores[this.currentPlayer].gross[this.currentHole - 1];
        const par = pageNavigator.scorecard.players[this.currentPlayer].tees.par[this.currentHole - 1];
        const shots = pageNavigator.scorecard.players[this.currentPlayer].shots[this.currentHole - 1];

        if (!gross || gross === 'X' || gross === '' || gross === 0) {
            return par + shots + 2;
        } else {
            return Math.min(par + shots + 2, gross);
        }
    }

    onScoreInputFocus(e) {
        const index = e.target.dataset.index;
        this.currentPlayer = parseInt(index);
    }

    onReviewBtnClick() {
        pageNavigator.goto('review');
        reviewPage.init();
    }

    onBackBtnClick() {
        pageNavigator.back();
    }

    onLostYellowBallCheckboxChange() {
        if (this.lostYellowBallCheckbox.checked) {
            pageNavigator.scorecard.lostYellowBall = this.currentHole;
            const yellowBallIndex = (this.currentHole - 1) % 3;
            const yellowBallInput = this.scoreInputArray[yellowBallIndex];
            yellowBallInput.focus();
            yellowBallInput.value = 'X';
        }
        else {
            pageNavigator.scorecard.lostYellowBall = null;
        }
        this.saveCurrentScore();
        this.renderHoleScore();
    }

    onScoreEntrySelectChange() {
        const value = this.scoreEntrySelect.value;
        const comp = pageNavigator.scorecard.competition;

        if (comp.type === Competition.Type.SCRAMBLE) {
            pageNavigator.scorecard.teeShot[this.currentHole - 1] = value;
        }

        if (comp.type === Competition.Type.FLAG) {
            pageNavigator.scorecard.flag = value;
        }

        this.saveCurrentScore();
    }

    renderHeader() {
        this.competitionName.textContent = data.competitionDisplayName(pageNavigator.scorecard.competition);
        this.competitionDate.textContent = new Date(pageNavigator.scorecard.competition.date).toLocaleDateString('en-GB');

        ui.renderPlayerHeader(pageNavigator.scorecard.players, this.playerHeader);
    }

    renderScoreEntryStyle() {
        const comp = pageNavigator.scorecard.competition;
        for (const method of Object.values(ScoreEntryMethod)) {
            this.scoreGrid.classList.remove(this.gridStyleFor(method));
        };

        this.scoreEntryMethod = this.scoreEntryMethodFor(comp);
        this.scoreGrid.classList.add(this.gridStyleFor(this.scoreEntryMethod));

        //Add rendering for scramble/flag select boxes
        if (this.scoreEntryMethod === ScoreEntryMethod.SCRAMBLE || this.scoreEntryMethod === ScoreEntryMethod.FLAG) {
            this.scoreEntrySelect.innerHTML = '';
            if (comp.type === Competition.Type.SCRAMBLE) {
                const team = pageNavigator.scorecard.players[0].team;
                for (let i = 0; i < team.length; i++) {
                    const option = document.createElement('option');
                    option.value = ['A', 'B', 'C', 'D'][i];
                    option.textContent = ['A', 'B', 'C', 'D'][i];
                    this.scoreEntrySelect.appendChild(option);
                }
                this.scoreEntryLabel.textContent = 'Teeshot';
            }

            if (comp.type === Competition.Type.FLAG) {
                for (const value of Scorecard.FLAG_VALUES) {
                    const option = document.createElement('option');
                    option.value = value.value;
                    option.textContent = value.text;
                    this.scoreEntrySelect.appendChild(option);
                }
                this.scoreEntryLabel.textContent = 'Flag';
            }
        }

        if (this.scoreEntryMethod === ScoreEntryMethod.YELLOWBALL || this.scoreEntryMethod === ScoreEntryMethod.WALTZ) {
            this.scoreInputArray[this.currentPlayer].focus();
        }
    }

    renderHoleScore() {
        // Update hole number
        this.holeNumber.textContent = '- ' + this.currentHole + ' -';

        // Update prior hole number (only for basic score entry)
        if (this.scoreEntryMethod === ScoreEntryMethod.BASIC) {
            if (this.currentHole === 1) {
                this.priorHoleNumber.textContent = '';
                this.priorScore.textContent = '';
            } else {
                this.priorHoleNumber.textContent = '- ' + (this.currentHole - 1) + ' -';
                this.priorScore.textContent = pageNavigator.scorecard.scores[0].gross[this.currentHole - 2];
            }
        }

        //Render yellow ball entry
        if (this.scoreEntryMethod === ScoreEntryMethod.YELLOWBALL) {
            const yellowBallIndex = (this.currentHole - 1) % 3;
            const lostYellowBall = pageNavigator.scorecard.lostYellowBall;
            for (let i = 0; i < 3; i++){
                if (i === yellowBallIndex && (!lostYellowBall || this.currentHole < lostYellowBall)) {
                    this.scoreInputArray[i].style.backgroundColor = 'yellow';
                }
                else {
                    this.scoreInputArray[i].style.backgroundColor = 'white';
                }
            }

            //If the yellow ball was lost, only enable the control for the hole it was lost on
            if (!pageNavigator.scorecard.lostYellowBall) {
                this.lostYellowBallCheckbox.disabled = false;
            }
            else {
                this.lostYellowBallCheckbox.disabled = pageNavigator.scorecard.lostYellowBall !== this.currentHole; 
                this.lostYellowBallCheckbox.checked = pageNavigator.scorecard.lostYellowBall === this.currentHole; 
            }
        }
        else {
            for(let i =0; i < pageNavigator.scorecard.players.length; i++) {
                this.scoreInputArray[i].style.backgroundColor = 'white';
            }
        }

        //Render flag entry
        if (this.scoreEntryMethod === ScoreEntryMethod.FLAG) {
            this.scoreEntrySelect.value = pageNavigator.scorecard.flag;
            this.scoreEntrySelect.disabled = !this.isFlagHole();
        }

        // Update score input with saved score for this hole
        for(let i =0; i < pageNavigator.scorecard.players.length; i++) {
            const score = pageNavigator.scorecard.scores[i].gross[this.currentHole - 1];
            this.scoreInputArray[i].value = `${score ?? ''}`;
        }

        //Render tee-shot for scramble
        if (this.scoreEntryMethod === ScoreEntryMethod.SCRAMBLE) {
            this.scoreEntrySelect.value = pageNavigator.scorecard.teeShot[this.currentHole - 1];
        }

        // Update next score (only for basic score entry)
        if (this.scoreEntryMethod === ScoreEntryMethod.BASIC) {
            if (this.currentHole === 18) {
                this.nextHoleNumber.textContent = '';
                this.nextScore.textContent = '';
            } else {
                this.nextHoleNumber.textContent = '- ' + (this.currentHole + 1) + ' -';
                this.nextScore.textContent = pageNavigator.scorecard.scores[0].gross[this.currentHole];
            }
        }
    }

    init() {
        this.currentPlayer = 0;
        this.currentHole = 1;

        this.loadScorecard()

        this.renderHeader();
        this.renderScoreEntryStyle();
        this.renderHoleScore();
    }
}

export const scoreEntryPage = new ScoreEntryPage();

