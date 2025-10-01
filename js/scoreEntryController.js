// Score Entry Controller - Manages the score entry page interactions
export class ScoreEntryController {
    constructor() {
        this.currentHole = 1;
        this.maxHoles = 18;
        this.scores = new Array(18).fill('');
        
        // DOM elements
        this.elements = {};
    }

    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.updateDisplay();
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

    attachEventListeners() {
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
        this.elements.resultsBtn.addEventListener('click', () => this.handleResults());
        this.elements.reviewBtn.addEventListener('click', () => this.handleReview());
        
        // Prevent manual input on score field
        this.elements.scoreInput.addEventListener('keydown', (e) => {
            e.preventDefault();
        });
    }

    navigateHole(direction) {
        // Save current score before navigating
        this.saveCurrentScore();
        
        const newHole = this.currentHole + direction;
        
        if (newHole < 1 || newHole > this.maxHoles) {
            return; // Don't navigate beyond bounds
        }
        
        this.currentHole = newHole;
        this.updateDisplay();
        
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
        } else {
            // Number key pressed
            if (currentScore === 'X') {
                // Replace X with number
                this.elements.scoreInput.value = value;
            } else if (currentScore.length < 2) {
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
        this.scores[this.currentHole - 1] = score;
    }

    updateDisplay() {
        // Update hole number
        this.elements.holeNumber.textContent = this.currentHole;
        
        // Update score input with saved score for this hole
        this.elements.scoreInput.value = this.scores[this.currentHole - 1];
        
        // Update arrow button states
        this.elements.prevHole.disabled = this.currentHole === 1;
        this.elements.nextHole.disabled = this.currentHole === this.maxHoles;
        
        // Visual feedback for disabled buttons
        if (this.currentHole === 1) {
            this.elements.prevHole.style.opacity = '0.4';
            this.elements.prevHole.style.cursor = 'not-allowed';
        } else {
            this.elements.prevHole.style.opacity = '1';
            this.elements.prevHole.style.cursor = 'pointer';
        }
        
        if (this.currentHole === this.maxHoles) {
            this.elements.nextHole.style.opacity = '0.4';
            this.elements.nextHole.style.cursor = 'not-allowed';
        } else {
            this.elements.nextHole.style.opacity = '1';
            this.elements.nextHole.style.cursor = 'pointer';
        }
    }

    handleResults() {
        this.saveCurrentScore();
        console.log('Results button clicked');
        console.log('Current scores:', this.scores);
    }

    handleReview() {
        this.saveCurrentScore();
        console.log('Review button clicked');
        console.log('Current scores:', this.scores);
    }

    // Public method to get all scores
    getScores() {
        this.saveCurrentScore();
        return [...this.scores];
    }

    // Public method to set player data
    setPlayerData(data) {
        if (data.competitionName) {
            this.elements.competitionName.textContent = data.competitionName;
        }
        if (data.competitionDate) {
            this.elements.competitionDate.textContent = data.competitionDate;
        }
        if (data.playerName) {
            this.elements.playerName.textContent = data.playerName;
        }
        if (data.handicapIndex) {
            this.elements.handicapIndex.textContent = data.handicapIndex;
        }
        if (data.playingHandicap) {
            this.elements.playingHandicap.textContent = data.playingHandicap;
        }
    }
}
