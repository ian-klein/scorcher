//Functions to get the data from golf genius

'use strict'

import { Player, Competition, Score } from './schema.js';

//Currently stubbed because golf genius API key is suspended

export function getPlayer(email) {
    const p = new Player();

    if (email === 'ian.klein14@gmail.com') {
        p.email = email;
        p.name = 'Ian Klein';
        p.hi = 20.7;
        p.gender = 'male';
    }

    if (email === 'peter.shanks1@gmail.com') {
        p.email = email;
        p.name = 'Peter Shanks';
        p.hi = 10.2;
        p.gender = 'male';
    }

    return p;
}

export function isValidEmail(email) {
    if (email === 'ian.klein14@gmail.com') {
        return true;
    }
    if (email === 'peter.shanks1@gmail.com') {
        return true;
    }
    return false;
}

export function getCompetition() {
    const c = new Competition();

    c.name = '08/10 Millers Stableford';
    c.date = new Date();

    //Determine the type of competition
    if (c.name.toLowerCase().includes('medal') || c.name.toLowerCase().includes('strokeplay')) {
        c.type = 'strokeplay';
    } else if (c.name.toLowerCase().includes('stableford')) {
        c.type = 'stableford';
    } else {
        c.type = 'team';
    }

    return c;
}

//====================== Saved from app.js just in case there sis something good here ==========================
// Page navigation
class PageNavigator {
    constructor() {
        this.splashScreen = new SplashScreen();
        this.pages = {
            scoreEntry: document.querySelector('[data-page="score-entry"]'),
            review: document.querySelector('[data-page="review"]'),
            results: document.querySelector('[data-page="results"]')
        };
    }

    showPage(pageName) {
        // Hide all pages
        Object.values(this.pages).forEach(page => {
            if (page) page.style.display = 'none';
        });

        // Show requested page
        if (this.pages[pageName]) {
            this.pages[pageName].style.display = 'flex';
        }
    }

    init() {
        // Show splash screen first
        this.splashScreen.show();
        
        // Initialize email input after a short delay
        setTimeout(() => {
            this.initEmailInput();
        }, 500);

        // Initialize score entry
        const scoreEntryController = new ScoreEntryController();
        scoreEntryController.init();

        // Set up navigation
        this.setupNavigation();
    }

    initEmailInput() {
        this.splashScreen.showEmailInput(true);
        
        this.splashScreen.onEmailSubmit((email) => {
            if (this.validateEmail(email)) {
                this.splashScreen.hide();
                this.showPage('scoreEntry');
                // Store email or use for authentication
                console.log('User email:', email);
            } else {
                this.splashScreen.setMessage('Please enter a valid email address');
            }
        });
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    setupNavigation() {
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