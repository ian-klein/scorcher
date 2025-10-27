//Manages the score entry page interactions

'use strict';

import { pageNavigator } from './pageNavigator.js';
import { reviewPage } from './reviewPage.js'
import { Score } from './schema.js';
import { data } from './data.js';

const SAVED_SCORES_KEY = 'saved_scores_v2';

class ScoreEntryPage {
    constructor() {
        this.currentHole = 1;
        this.maxHoles = 18;
        
        // DOM elements
        // Header elements
        this.competitionName = document.getElementById('competitionName');
        this.competitionDate = document.getElementById('competitionDate');
        this.playerName = document.getElementById('playerName');
        
        // Hole elements
        this.holeNumber = document.getElementById('holeNumber');
        this.priorHoleNumber = document.getElementById('priorHoleNumber');
        this.nextHoleNumber = document.getElementById('nextHoleNumber');
        this.scoreInput = document.getElementById('scoreInput');
        this.priorScore = document.getElementById('priorScore');
        this.nextScore = document.getElementById('nextScore');
        this.prevHole = document.getElementById('prevHole');
        this.nextHole = document.getElementById('nextHole');
        
        // Keypad elements
        this.keypad = document.querySelector('.keypad');
        this.numberKeys = document.querySelectorAll('.number-key');
        this.specialKey = document.querySelector('.special-key');
        this.deleteKey = document.querySelector('.delete-key');
        
        // Action buttons
        this.reviewBtn = document.getElementById('reviewBtn');

        this.scores = [];
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

    init() {
        this.loadScores()

        this.renderHeader();
        this.renderHoleScore();
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
        
        // Prevent manual input on score field
        this.scoreInput.addEventListener('keydown', (e) => {
            e.preventDefault();
        });
    }

    navigateHole(direction) {

        let newHole = this.currentHole + direction;
        
        if (newHole < 1) newHole = 18;
        if (newHole > 18) newHole = 1;
        
        this.currentHole = newHole;
        this.renderHoleScore();
    }

    handleKeypadInput(value) {
        const currentScore = this.scoreInput.value;
        let autoNavigate = true;
        
        if (value === 'DEL') {
            // Delete last character
            this.scoreInput.value = currentScore.slice(0, -1);
            autoNavigate = false;
        } else if (value === 'X') {
            // X typically means no score or not played
            this.scoreInput.value = 'X';
        } else if (value === '0' && currentScore === '') {
            // 0 typically means no score or not played
            this.scoreInput.value = 'X';
        } else {
            // Number key pressed
            if (currentScore === 'X' || currentScore === '') {
                // Set score as the number
                this.scoreInput.value = value;
                autoNavigate = value !== '1';
            } else if (currentScore === '1') {
                // Add digit (max 2 digits)
                this.scoreInput.value = currentScore + value;
            }
        }

        this.saveCurrentScore();

        //If the next hole is not yet scored, navigate to it
        if (autoNavigate && this.currentHole < 18 && !this.scores[0].gross[this.currentHole]) {
            this.navigateHole(1);
        }
    }

    saveCurrentScore() {
        const gross = this.scoreInput.value;
        this.scores[0].gross[this.currentHole - 1] = gross;
        this.scores[0].points[this.currentHole - 1] = this.calculatePoints(0);
        this.scores[0].adjusted[this.currentHole - 1] = this.calculateAdjusted(0);
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

    onReviewBtnClick() {
        pageNavigator.scores = this.scores;
        pageNavigator.showPage('review');
        reviewPage.init();
    }

    renderHeader() {
        this.competitionName.textContent = data.competitionDisplayName(pageNavigator.competition);
        this.competitionDate.textContent = pageNavigator.competition.date.toLocaleDateString('en-GB');


        const labels = ['A:', 'B:', 'C:', 'D:']
        const team = pageNavigator.players.map((p, index) => {
            return `${labels[index]} ${p.name}(${p.ph})`;
        });
        this.playerName.textContent = team.join(', ');
    }

    renderHoleScore() {
        // Update hole number
        this.holeNumber.textContent = '- ' + this.currentHole + ' -';

        // Update prior hole number
        if (this.currentHole === 1) {
            this.priorHoleNumber.textContent = '';
            this.priorScore.textContent = '';
        } else {
            this.priorHoleNumber.textContent = this.currentHole - 1;
            this.priorScore.textContent = this.scores[0].gross[this.currentHole - 2];
        }
        
        // Update score input with saved score for this hole
        const score = this.scores[0].gross[this.currentHole - 1];
        this.scoreInput.value = `${score ?? ''}`;

        // Update next score
        if (this.currentHole === 18 || !this.scores[0].gross[this.currentHole]) {
            this.nextHoleNumber.textContent = '';
            this.nextScore.textContent = '';
        } else {
            this.nextHoleNumber.textContent = this.currentHole + 1;
            this.nextScore.textContent = this.scores[0].gross[this.currentHole];
        }
    }

}

export const scoreEntryPage = new ScoreEntryPage();

