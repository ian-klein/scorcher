// Logic for the splash screen (which also prompts for email if we did not already have it)
'use strict';

import { getCompetition, getPlayer } from './data.js';
import { pageNavigator } from './pageNavigator.js';
import { scoreEntryPage } from './scoreEntryPage.js';

const EMAIL_STORAGE_KEY = 'email_v1';

class SplashPage {
    constructor() {
        this.splashScreen = document.getElementById('splashScreen');
        this.splashControls = document.getElementById('splashControls');
        this.emailInput = document.getElementById('emailInput');
        this.emailInputGroup = document.getElementById('emailInputGroup');
        this.submitEmail = document.getElementById('submitEmail');
        this.splashMessage = document.getElementById('splashMessage');
    }

    init() {
        //Get email from local storage and hide the inout controls if found
        const email = localStorage.getItem(EMAIL_STORAGE_KEY);
        if (email) {
            this.emailInput.value = email;
        }
        this.submitEmail.disabled = !email || email.length === 0;


        //Check that today is a Wednesday
        const today = new Date();
        const day = today.getDay();
        const isDayEnforced = false;
        if (day !== 3 && isDayEnforced) {
            this.displayMessage('There is no competition today - it is not a Wednesday!');
            this.submitEmail.disabled = true;
        }

        const comp = getCompetition();
        pageNavigator.competition = comp;

        if (comp.type === 'other') {
            this.displayMessage('Only use this app for individual Stableford or strokeplay competitions. For this competition just put your signed, completed card in the box');
            this.submitEmail.disabled = true;
        }

        this.wireEvents();
    }

    hide() {
        this.splashScreen.style.display = 'none';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    displayMessage(message) {
        this.splashMessage.textContent = message;
    }

    onSubmitEmailClick() {
        const email = this.emailInput.value.trim();
        if (email) {
            const player = getPlayer(email);
            if (!player) {
                this.displayMessage('Email address is not in the Golf Genius master roster');
                return;
            }
            localStorage.setItem(EMAIL_STORAGE_KEY, email);
            pageNavigator.player = player;
    
            this.hide();
            scoreEntryPage.init();
            pageNavigator.showPage('scoreEntry');
        }
    }
    
    onEmailInputInput() {
        const email = this.emailInput.value.trim();
        this.submitEmail.disabled = !email || email.length === 0;
    }
    
    wireEvents() {
        this.submitEmail.addEventListener('click', () => this.onSubmitEmailClick());
        this.emailInput.addEventListener('input', () => this.onEmailInputInput());
    }
}

export const splashPage = new SplashPage();
