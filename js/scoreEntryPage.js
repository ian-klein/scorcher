//Manages the score entry page interactions

'use strict';

import { pageNavigator } from './pageNavigator.js';
import { reviewPage } from './reviewPage.js'
import { Competition, Score } from './schema.js';
import { data } from './data.js';
import { ui } from './ui.js';

const SAVED_SCORES_KEY = 'saved_scores_v2';

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

        this.scores = [];
        this.currentPlayer = 0;     //Index of the player scoring
        this.currentHole = 1;       //Current hole being scored
        this.scoreEntryMethod = null;

        this.wireEvents();
    }

    saveScores() {
        localStorage.setItem(SAVED_SCORES_KEY, JSON.stringify(this.scores));
    }

    loadScores() {
        const comp = pageNavigator.competition;
        const players = pageNavigator.players;
        this.scores = [];

        const savedScores = localStorage.getItem(SAVED_SCORES_KEY);
        if (!savedScores) {
            for(const player of players) {
                this.scores.push(new Score(player, comp.date));
            }
        }
        else {
            const scores = JSON.parse(savedScores, (key,value) => { if (key === 'date') { return new Date(value); } else { return value; } } );
            
            for(const player of players) {
                const score = scores.find(s => s.email === player.email);
                if (score && score.date.toISOString().slice(0, 10) === comp.date.toISOString().slice(0, 10)) {
                    this.scores.push(score);
                }
                else {
                    this.scores.push(new Score(player, comp.date));
                }
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
        
        // Prevent manual input on score fields
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
        if (autoNavigate && this.currentHole < 18 && !this.scores[0].gross[this.currentHole]) {
            this.navigateHole(1);
        }
    }

    saveCurrentScore() {
        const scoreInput = this.scoreInputArray[this.currentPlayer];
        const gross = scoreInput.value;
        this.scores[this.currentPlayer].gross[this.currentHole - 1] = gross;
        this.scores[this.currentPlayer].points[this.currentHole - 1] = this.calculatePoints(this.currentPlayer);
        this.scores[this.currentPlayer].adjusted[this.currentHole - 1] = this.calculateAdjusted(this.currentPlayer);
        this.saveScores();
    }

    calculatePoints(index) {
        const gross = this.scores[index].gross[this.currentHole - 1];

        if (!gross || gross === 'X' || gross === '' || gross === 0) {
            return 0;
        } else {
            const par = pageNavigator.players[index].tees.par[this.currentHole - 1];
            const nett = gross - pageNavigator.players[index].shots[this.currentHole - 1];

            const points = Math.max(0,  par-nett + 2);
            return points;
        }
    }
    
    calculateAdjusted(index) {
        const gross = this.scores[index].gross[this.currentHole - 1];
        const par = pageNavigator.players[index].tees.par[this.currentHole - 1];
        const shots = pageNavigator.players[index].shots[this.currentHole - 1];

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
        pageNavigator.scores = this.scores;
        pageNavigator.showPage('review');
        reviewPage.init();
    }

    renderHeader() {
        this.competitionName.textContent = data.competitionDisplayName(pageNavigator.competition);
        this.competitionDate.textContent = pageNavigator.competition.date.toLocaleDateString('en-GB');

        ui.renderPlayerHeader(pageNavigator.players, this.playerHeader);
    }

    renderScoreEntryStyle() {
        const comp = pageNavigator.competition;
        for (const method of SCORE_ENTRY_METHODS) {
            this.scoreGrid.classList.remove(this.gridStyleFor(method));
        };

        this.scoreEntryMethod = this.scoreEntryMethodFor(comp);
        this.scoreGrid.classList.add(this.gridStyleFor(this.scoreEntryMethod));

        //Add rendering for scramble/flag select boxes
        if (this.scoreEntryMethod === SCRAMBLE_SCORE_ENTRY) {
            if (comp.type === Competition.Type.SCRAMBLE) {
                const team = pageNavigator.players[0].team;
                for (let i = 0; i < team.length; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = ['A', 'B', 'C', 'D'][i];
                    this.scoreEntrySelect.appendChild(option);
                }
                this.scoreEntryLabel.textContent = 'Teeshot';
            }

            if (comp.type === Competition.Type.FLAG) {
                for (const value of Score.FLAG_VALUES) {
                    const option = document.createElement('option');
                    option.value = value.value;
                    option.textContent = value.text;
                    this.scoreEntrySelect.appendChild(option);
                }
                this.scoreEntryLabel.textContent = 'Flag';
            }
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
                this.priorScore.textContent = this.scores[0].gross[this.currentHole - 2];
            }
        }
        
        // Update score input with saved score for this hole
        for(let i =0; i < pageNavigator.players.length; i++) {
            const score = this.scores[i].gross[this.currentHole - 1];
            this.scoreInputArray[i].value = `${score ?? ''}`;
        }

        // Update next score (only for basic score entry)
        if (this.scoreEntryMethod === BASIC_SCORE_ENTRY) {
            if (this.currentHole === 18) {
                this.nextHoleNumber.textContent = '';
                this.nextScore.textContent = '';
            } else {
                this.nextHoleNumber.textContent = '- ' + (this.currentHole + 1) + ' -';
                this.nextScore.textContent = this.scores[0].gross[this.currentHole];
            }
        }
    }

    init() {
        this.loadScores()

        this.renderHeader();
        this.renderScoreEntryStyle();
        this.renderHoleScore();
    }
}

export const scoreEntryPage = new ScoreEntryPage();

