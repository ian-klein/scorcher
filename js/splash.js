// Logic for the splash screen (which also prompts for email if we did not already have it)
'use strict';

import { getCompetition, isValidEmail, getPlayer } from './data.js';
import { navigator } from './navigator.js';

const EMAIL_STORAGE_KEY = 'email_v1';

export class SplashScreen {
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

        //Check that today is a wednesday
        const today = new Date();
        const day = today.getDay();
        if (day !== 3) {
            this.displayMessage('There is no competition today - it is not a Wednesday!');
            this.submitEmail.disabled = true;
        }

        const comp = getCompetition();
        navigator.competition = comp;

        if (comp.type === 'team') {
            this.displayMessage('Do not use this app for team competitions - just put your signed, completed card in the box');
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

    wireEvents() {
        this.submitEmail.addEventListener('click', () => onSubmitEmailClick(this));
    }
}

function onSubmitEmailClick(splashScreen) {
    const email = splashScreen.emailInput.value.trim();
    if (email) {
        if (!isValidEmail(email)) {
            splashScreen.displayMessage('Email address is not in the Golf Genius master roster');
            return;
        }
        localStorage.setItem(EMAIL_STORAGE_KEY, email);
        navigator.player = getPlayer(email);

        splashScreen.hide();
        navigator.showPage('scoreEntry');
    }
}    
