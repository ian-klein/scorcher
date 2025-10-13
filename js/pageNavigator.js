//Navigate between pages in the app

'use strict';

class PageNavigator {
    constructor() {
        this.pages = {
            scoreEntry: document.querySelector('[data-page="score-entry"]'),
            review: document.querySelector('[data-page="review"]'),
            admin: document.querySelector('[data-page="admin"]')
        };
        this.player = null;
        this.competition = null;
        this.scores = null;
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
}

export const pageNavigator = new PageNavigator();
