// Main application entry point
import { ScoreEntryController } from './scoreEntryController.js';

// Page navigation
class PageNavigator {
    constructor() {
        this.pages = {
            scoreEntry: document.querySelector('[data-page="score-entry"]'),
            review: document.querySelector('[data-page="review"]')
        };
    }

    showPage(pageName) {
        // Hide all pages
        Object.values(this.pages).forEach(page => {
            page.style.display = 'none';
        });

        // Show requested page
        if (this.pages[pageName]) {
            this.pages[pageName].style.display = 'flex';
        }
    }

    init() {
        // Review button - navigate to review page
        const reviewBtn = document.getElementById('reviewBtn');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => {
                this.showPage('review');
            });
        }

        // Back button - navigate to score entry page
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.showPage('scoreEntry');
            });
        }

        // Submit button - placeholder for now
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                console.log('Submit button clicked - functionality to be implemented');
            });
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const scoreEntryController = new ScoreEntryController();
    scoreEntryController.init();

    const pageNavigator = new PageNavigator();
    pageNavigator.init();
});
