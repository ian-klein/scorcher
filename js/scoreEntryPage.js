//Manages the score entry page interactions

'use strict';

import { pageNavigator } from './pageNavigator.js';
import { reviewPage } from './reviewPage.js'
import { Scores } from './schema.js';

class ScoreEntryPage {
    constructor() {
        this.currentHole = 1;
        this.maxHoles = 18;
        
        // DOM elements
        // Header elements
        this.competitionName = document.getElementById('competitionName');
        this.competitionDate = document.getElementById('competitionDate');
        this.playerName = document.getElementById('playerName');
        this.handicapIndex = document.getElementById('handicapIndex');
        this.playingHandicap = document.getElementById('playingHandicap');
        
        // Hole elements
        this.holeNumber = document.getElementById('holeNumber');
        this.scoreInput = document.getElementById('scoreInput');
        this.prevHole = document.getElementById('prevHole');
        this.nextHole = document.getElementById('nextHole');
        
        // Keypad elements
        this.keypad = document.querySelector('.keypad');
        this.numberKeys = document.querySelectorAll('.number-key');
        this.specialKey = document.querySelector('.special-key');
        this.deleteKey = document.querySelector('.delete-key');
        
        // Action buttons
        this.resultsBtn = document.getElementById('resultsBtn');
        this.reviewBtn = document.getElementById('reviewBtn');

        this.scores = new Scores();
        this.wireEvents();
    }

    init() {
        this.renderHeader();
        this.renderHoleScore();
    }


    wireEvents() {
        // Navigation arrows
        this.prevHole.addEventListener('click', () => this.navigateHole(-1));
        this.nextHole.addEventListener('click', () => this.navigateHole(1));
        
        // Keypad buttons
        this.keypad.addEventListener('click', (e) => {
            const btn = e.target.closest('.key-btn');
            if (!btn) return;
            
            const value = btn.dataset.value;
            this.handleKeypadInput(value);
        });
        
        // Action buttons
        this.resultsBtn.addEventListener('click', () => this.onResultsBtnClick());
        this.reviewBtn.addEventListener('click', () => this.onReviewBtnClick());
        
        // Prevent manual input on score field
        this.scoreInput.addEventListener('keydown', (e) => {
            e.preventDefault();
        });
    }

    navigateHole(direction) {
        // Save current score before navigating
        this.saveCurrentScore();
        
        let newHole = this.currentHole + direction;
        
        if (newHole < 1) newHole = 18;
        if (newHole > 18) newHole = 1;
        
        this.currentHole = newHole;
        this.renderHoleScore();
        
        // Add haptic feedback on mobile devices
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    handleKeypadInput(value) {
        const currentScore = this.scoreInput.value;
        
        if (value === 'DEL') {
            // Delete last character
            this.scoreInput.value = currentScore.slice(0, -1);
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
            } else if (currentScore === '1') {
                // Add digit (max 2 digits)
                this.scoreInput.value = currentScore + value;
            }
        }
        
        // Add haptic feedback on mobile devices
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    saveCurrentScore() {
        const score = this.scoreInput.value;
        this.scores.gross[this.currentHole - 1] = score;
        this.scores.points[this.currentHole - 1] = this.calculatePoints();
        this.scores.adjusted[this.currentHole - 1] = this.calculateAdjusted();
    }

    calculatePoints() {
        const score = this.scores.gross[this.currentHole - 1]

        if (!score || score === 'X' || score === '' || score === 0) {
            return 0;
        } else {
            const par = pageNavigator.player.tees.par[this.currentHole - 1];
            const nett = score - pageNavigator.player.shots[this.currentHole - 1];

            const points = Math.max(0,  par-nett + 2);
            return points;
        }
    }
    
    calculateAdjusted() {
        const score = this.scores.gross[this.currentHole - 1];
        const par = pageNavigator.player.tees.par[this.currentHole - 1];
        const shots = pageNavigator.player.shots[this.currentHole - 1];

        if (!score || score === 'X' || score === '' || score === 0) {
            return par + shots + 2;
        } else {
            return Math.min(par + shots + 2, score);
        }
    }


    onResultsBtnClick() {
        this.saveCurrentScore();
        pageNavigator.showPage('results');
    }

    onReviewBtnClick() {
        this.saveCurrentScore();
        pageNavigator.scores = this.scores;
        reviewPage.init();
        pageNavigator.showPage('review');
    }

    renderHeader() {
        this.competitionName.textContent = pageNavigator.competition.name;
        this.competitionDate.textContent = pageNavigator.competition.date;
        this.playerName.textContent = pageNavigator.player.name;
        this.handicapIndex.textContent = pageNavigator.player.hi;
        this.playingHandicap.textContent = pageNavigator.player.ph;
    }

    renderHoleScore() {
        // Update hole number
        this.holeNumber.textContent = this.currentHole;
        
        // Update score input with saved score for this hole
        const score = this.scores.gross[this.currentHole - 1];
        this.scoreInput.value = `${score ?? ''}`;
    }

}

export const scoreEntryPage = new ScoreEntryPage();

