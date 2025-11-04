//Navigate between pages in the app

'use strict';

class PageNavigator {
    constructor() {
        this.pages = {
            splash: document.querySelector('[data-page="splash"]'),
            scoreEntry: document.querySelector('[data-page="score-entry"]'),
            review: document.querySelector('[data-page="review"]'),
            admin: document.querySelector('[data-page="admin"]'),
            team: document.querySelector('[data-page="team"]'),
            akq: document.querySelector('[data-page="akq"]')
        };

        this.scorecard = null;
        this.breadcrumbs = [];
        this.breadcrumbs.push("splash");

        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    goto(pageName) {
        this.breadcrumbs.push(pageName);
        this.#showPage(pageName);
    }

    back() {
        this.breadcrumbs.pop();
        this.#showPage(this.breadcrumbs[this.breadcrumbs.length - 1]);
    }   

    //Display the page
    #showPage(pageName) {
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
