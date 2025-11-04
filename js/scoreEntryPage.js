//Manages the score entry page interactions

'use strict';

import { pageNavigator } from './pageNavigator.js';
import { reviewPage } from './reviewPage.js'
import { Competition, Scorecard, Score } from './schema.js';
import { data } from './data.js';
import { ui } from './ui.js';

const SAVED_SCORES_KEY = 'saved_scores_v3';

//The differnt score entry methods
const BASIC_SCORE_ENTRY = 'basic';
const SCRAMBLE_SCORE_ENTRY   = Competition.Type.SCRAMBLE;
const WALTZ_SCORE_ENTRY      = Competition.Type.WALTZ;
const YELLOWBALL_SCORE_ENTRY = Competition.Type.YELLOWBALL;
const FOURBALL_SCORE_ENTRY   = Competition.Type.FOURBALL;

const SCORE_ENTRY_METHODS = [
    BASIC_SCORE_ENTRY,      //Individual, single score
    SCRAMBLE_SCORE_ENTRY,   //Also used for flag - adds a dropdown
    WALTZ_SCORE_ENTRY,      //1,2,3 scores
    YELLOWBALL_SCORE_ENTRY, //All 3 scores, with lost ball checkbox
    FOURBALL_SCORE_ENTRY    //1 of 2 scores
];

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
        const rawScorecard = localStorage.getItem(SAVED_SCORES_KEY);

        if (rawScorecard) {
            const scorecard = Scorecard.fromJSON(rawScorecard);
            if (scorecard.competition.type === pageNavigator.scorecard.competition.type && scorecard.competition.date === pageNavigator.scorecard.competition.date) {
                //Same date and type - zeroize scores for players that are not in the page context
                for (let i = 0; i < scorecard.players.length; i++) {
                    const player = scorecard.players[i];
                    if (!pageNavigator.scorecard.players.find(p => p.name === player.name)) {
                        scorecard.scores[i] = new Score();
                    }
                }
                pageNavigator.scorecard = scorecard;
            }
            else {
                //Different date or type - reset scores
                pageNavigator.scorecard = new Scorecard({competition: pageNavigator.scorecard.competition, players: pageNavigator.scorecard.players});
            }
        }
    }

    gridStyleFor(scoreEntryMethod) {
        return scoreEntryMethod + STYLE_SUFFIX;
    }

    scoreEntryMethodFor(comp) {
        const type = comp.type === 'flag' ? 'scramble' : comp.type;
        if (SCORE_ENTRY_METHODS.includes(type)) {
            return type;
        }
        else {
            return BASIC_SCORE_ENTRY;
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
        let autoNavigate = this.scoreEntryMethod === BASIC_SCORE_ENTRY;
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
        for (const method of SCORE_ENTRY_METHODS) {
            this.scoreGrid.classList.remove(this.gridStyleFor(method));
        };

        this.scoreEntryMethod = this.scoreEntryMethodFor(comp);
        this.scoreGrid.classList.add(this.gridStyleFor(this.scoreEntryMethod));

        //Add rendering for scramble/flag select boxes
        if (this.scoreEntryMethod === SCRAMBLE_SCORE_ENTRY) {
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

        if (this.scoreEntryMethod === YELLOWBALL_SCORE_ENTRY || this.scoreEntryMethod === WALTZ_SCORE_ENTRY) {
            this.scoreInputArray[this.currentPlayer].focus();
        }
    }

    renderHoleScore() {
        // Update hole number
        this.holeNumber.textContent = '- ' + this.currentHole + ' -';

        // Update prior hole number (only for basic score entry)
        if (this.scoreEntryMethod === BASIC_SCORE_ENTRY) {
            if (this.currentHole === 1) {
                this.priorHoleNumber.textContent = '';
                this.priorScore.textContent = '';
            } else {
                this.priorHoleNumber.textContent = '- ' + (this.currentHole - 1) + ' -';
                this.priorScore.textContent = pageNavigator.scorecard.scores[0].gross[this.currentHole - 2];
            }
        }

        //Format yellow ball entry
        if (this.scoreEntryMethod === YELLOWBALL_SCORE_ENTRY) {
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

        // Update score input with saved score for this hole
        for(let i =0; i < pageNavigator.scorecard.players.length; i++) {
            const score = pageNavigator.scorecard.scores[i].gross[this.currentHole - 1];
            this.scoreInputArray[i].value = `${score ?? ''}`;
        }

        if (this.scoreEntryMethod === SCRAMBLE_SCORE_ENTRY) {
            const comp = pageNavigator.scorecard.competition;

            if (comp.type === Competition.Type.SCRAMBLE) {
                this.scoreEntrySelect.value = pageNavigator.scorecard.teeShot[this.currentHole - 1];
            }

            if (comp.type === Competition.Type.FLAG) {
                this.scoreEntrySelect.value = pageNavigator.scorecard.flag;
            }
        }

        // Update next score (only for basic score entry)
        if (this.scoreEntryMethod === BASIC_SCORE_ENTRY) {
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

