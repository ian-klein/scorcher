//Manages the score entry page interactions

'use strict';

import { pageNavigator } from './page-navigator.js';
import { reviewPage } from './reviewPage.js'
import { Scores } from './schema.js';

class ScoreEntry {
    constructor() {
        this.currentHole = 1;
        this.maxHoles = 18;
        
        // DOM elements
        this.elements = {};
        this.scores = new Scores();
    }

    init() {
        this.cacheElements();
        this.wireEvents();
        this.renderHeader();
        this.renderHoleScore();
    }

    cacheElements() {
        // Header elements
        this.elements.competitionName = document.getElementById('competitionName');
        this.elements.competitionDate = document.getElementById('competitionDate');
        this.elements.playerName = document.getElementById('playerName');
        this.elements.handicapIndex = document.getElementById('handicapIndex');
        this.elements.playingHandicap = document.getElementById('playingHandicap');
        
        // Hole elements
        this.elements.holeNumber = document.getElementById('holeNumber');
        this.elements.scoreInput = document.getElementById('scoreInput');
        this.elements.prevHole = document.getElementById('prevHole');
        this.elements.nextHole = document.getElementById('nextHole');
        
        // Keypad elements
        this.elements.keypad = document.querySelector('.keypad');
        this.elements.numberKeys = document.querySelectorAll('.number-key');
        this.elements.specialKey = document.querySelector('.special-key');
        this.elements.deleteKey = document.querySelector('.delete-key');
        
        // Action buttons
        this.elements.resultsBtn = document.getElementById('resultsBtn');
        this.elements.reviewBtn = document.getElementById('reviewBtn');
    }

    wireEvents() {
        // Navigation arrows
        this.elements.prevHole.addEventListener('click', () => this.navigateHole(-1));
        this.elements.nextHole.addEventListener('click', () => this.navigateHole(1));
        
        // Keypad buttons
        this.elements.keypad.addEventListener('click', (e) => {
            const btn = e.target.closest('.key-btn');
            if (!btn) return;
            
            const value = btn.dataset.value;
            this.handleKeypadInput(value);
        });
        
        // Action buttons
        this.elements.resultsBtn.addEventListener('click', () => this.onResultsBtnClick());
        this.elements.reviewBtn.addEventListener('click', () => this.onReviewBtnClick());
        
        // Prevent manual input on score field
        this.elements.scoreInput.addEventListener('keydown', (e) => {
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
        const currentScore = this.elements.scoreInput.value;
        
        if (value === 'DEL') {
            // Delete last character
            this.elements.scoreInput.value = currentScore.slice(0, -1);
        } else if (value === 'X') {
            // X typically means no score or not played
            this.elements.scoreInput.value = 'X';
        } else if (value === '0' && currentScore === '') {
            // 0 typically means no score or not played
            this.elements.scoreInput.value = 'X';
        } else {
            // Number key pressed
            if (currentScore === 'X' || currentScore === '') {
                // Set score as the number
                this.elements.scoreInput.value = value;
            } else if (currentScore === '1') {
                // Add digit (max 2 digits)
                this.elements.scoreInput.value = currentScore + value;
            }
        }
        
        // Add haptic feedback on mobile devices
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    saveCurrentScore() {
        const score = this.elements.scoreInput.value;
        this.scores.gross[this.currentHole - 1] = score;
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
        this.elements.competitionName.textContent = pageNavigator.competition.name;
        this.elements.competitionDate.textContent = pageNavigator.competition.date;
        this.elements.playerName.textContent = pageNavigator.player.name;
        this.elements.handicapIndex.textContent = pageNavigator.player.hi;
        this.elements.playingHandicap.textContent = pageNavigator.player.ph;
    }

    renderHoleScore() {
        // Update hole number
        this.elements.holeNumber.textContent = this.currentHole;
        
        // Update score input with saved score for this hole
        const score = this.scores.gross[this.currentHole - 1];
        this.elements.scoreInput.value = `${score ?? ''}`;
    }

}

export const scoreEntry = new ScoreEntry();

