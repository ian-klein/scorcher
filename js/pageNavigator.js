//Navigate between pages in the app

'use strict';

class PageNavigator {
    constructor() {
        this.pages = {
            scoreEntry: document.querySelector('[data-page="score-entry"]'),
            review: document.querySelector('[data-page="review"]'),
            admin: document.querySelector('[data-page="admin"]'),
            team: document.querySelector('[data-page="team"]')
        };

        //Context data passed between pages - players[0]/scores[0] is player A, players[1]/scores[1] is player B, etc
        this.competition = null;
        this.players = [];
        this.scores = [];
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
