// Main application entry point
import { ScoreEntryController } from './scoreEntryController.js';

// Page navigation
class PageNavigator {
    constructor() {
        this.pages = {
            scoreEntry: document.querySelector('[data-page="score-entry"]'),
            review: document.querySelector('[data-page="review"]'),
            results: document.querySelector('[data-page="results"]')
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
        // Results button - navigate to results page
        const resultsBtn = document.getElementById('resultsBtn');
        if (resultsBtn) {
            resultsBtn.addEventListener('click', () => {
                this.showPage('results');
            });
        }

        // Review button - navigate to review page
        const reviewBtn = document.getElementById('reviewBtn');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => {
                this.showPage('review');
            });
        }

        // Back button (from review page) - navigate to score entry page
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.showPage('scoreEntry');
            });
        }

        // Back button (from results page) - navigate to score entry page
        const resultsBackBtn = document.getElementById('resultsBackBtn');
        if (resultsBackBtn) {
            resultsBackBtn.addEventListener('click', () => {
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

        // Download button - placeholder for now
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                console.log('Download button clicked - functionality to be implemented');
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
