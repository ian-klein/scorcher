// Logic for the splash screen (which also prompts for email if we did not already have it)
'use strict';

import { getCompetition, getPlayer } from './data.js';
import { pageNavigator } from './pageNavigator.js';
import { scoreEntryPage } from './scoreEntryPage.js';

const PLAYER_STORAGE_KEY= 'player_v1'

class SplashPage {
    constructor() {
        this.splashScreen = document.getElementById('splashScreen');
        this.splashControls = document.getElementById('splashControls');
        this.emailInput = document.getElementById('emailInput');
        this.handicapValue = document.getElementById('handicapValue');
        this.emailInputGroup = document.getElementById('emailInputGroup');
        this.submitEmail = document.getElementById('submitEmail');
        this.splashMessage = document.getElementById('splashMessage');
    }

    init() {
        //Get email & PH from local storage
        const raw = localStorage.getItem(PLAYER_STORAGE_KEY);
        if (raw) {
            const storedPlayer = JSON.parse(raw);

            this.emailInput.value = storedPlayer.email;
            this.handicapValue.value = storedPlayer.ph;            
        }
            
        this.submitEmail.disabled = !this.emailInput.value || this.emailInput.value.length === 0 || 
                                    !this.handicapValue.value || this.handicapValue.value.length === 0;


        //Check that today is a Wednesday
        const today = new Date();
        const day = today.getDay();
        const isDayEnforced = false; //Remove for production
        if (day !== 3 && isDayEnforced) {
            alert('There is no competition today - it is not a Wednesday!');
            this.submitEmail.disabled = true;
        }

        const comp = getCompetition();
        pageNavigator.competition = comp;

        if (comp.type === 'other') {
            alert('Only use this app for individual Stableford or strokeplay competitions. For this competition just put your signed, completed card in the box');
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
        const ph = this.handicapValue.value.trim();
        if (email && ph) {
            const player = getPlayer(email,ph);
            if (!player) {
                this.displayMessage('Email address is not in the Golf Genius master roster');
                return;
            }

            const storedPlayer = {
                email: email,
                ph: ph
            }
            localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(storedPlayer));
            pageNavigator.player = player;
    
            this.hide();
            scoreEntryPage.init();
            pageNavigator.showPage('scoreEntry');
        }
    }

    enableSubmit() {
        const email = this.emailInput.value.trim();
        const ph = this.handicapValue.value.trim();
        this.submitEmail.disabled = !email || email.length === 0 || !ph || ph.length === 0;
    }
    
    onEmailInputInput() {
        this.enableSubmit();
    }

    onHandicapValueInput() {
        this.enableSubmit();
    }

    wireEvents() {
        this.submitEmail.addEventListener('click', () => this.onSubmitEmailClick());
        this.emailInput.addEventListener('input', () => this.onEmailInputInput());
        this.handicapValue.addEventListener('input', () => this.onHandicapValueInput());
    }
}

export const splashPage = new SplashPage();
