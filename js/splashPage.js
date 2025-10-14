// Logic for the splash screen (which also prompts for email if we did not already have it)
'use strict';

import { getCompetition, getPlayer } from './data.js';
import { pageNavigator } from './pageNavigator.js';
import { scoreEntryPage } from './scoreEntryPage.js';
import { adminPage } from './adminPage.js';

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
        this.adminBtn = document.getElementById('adminBtn');
    }

    renderAdminButton() {
        const email = this.emailInput.value.trim();
        const ph = this.handicapValue.value.trim();
        const player = getPlayer(email,ph);
        const isAdmin = player && player.admin;

        if (isAdmin) {
            this.adminBtn.style.display = 'block';
        } else {
            this.adminBtn.style.display = 'none';
        }
    }

    renderSubmitButton() {
        const email = this.emailInput.value.trim();
        const ph = this.handicapValue.value.trim();
        this.submitEmail.disabled = !email || email.length === 0 || !ph || ph.length === 0;
    }

    renderPage() {
        this.renderAdminButton();
        this.renderSubmitButton();
        this.displayMessage('');
    }

    init() {
        //Get email & PH from local storage
        const raw = localStorage.getItem(PLAYER_STORAGE_KEY);
        if (raw) {
            const storedPlayer = JSON.parse(raw);

            this.emailInput.value = storedPlayer.email;
            this.handicapValue.value = storedPlayer.ph;            
        }

        this.renderPage();
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
                this.displayMessage('That email address is not in the player database');
                return;
            }

            //Check that today is a Wednesday (but only for non-admin users)
            const today = new Date();
            const day = today.getDay();
            if (day !== 3 && !player.admin) {
                this.displayMessage('There is no competition today - it is not a Wednesday!');
                return;
            }

            //Only score Stableford and strokeplay
            const comp = getCompetition();
            if (comp.type === 'other') {
                this.displayMessage('Only use this app for individual Stableford or strokeplay competitions. For this competition just put your signed, completed card in the box');
            }

            const storedPlayer = {
                email: email,
                ph: ph
            }
            localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(storedPlayer));

            pageNavigator.player = player;
            pageNavigator.competition = comp;
    
            this.hide();
            scoreEntryPage.init();
            pageNavigator.showPage('scoreEntry');
        }
    }

    onEmailInputInput() {
        this.renderPage();
    }

    onHandicapValueInput() {
        this.renderSubmitButton();
    }

    onAdminBtnClick() {
        const email = this.emailInput.value.trim();
        const ph = this.handicapValue.value.trim();
        const player = getPlayer(email,ph);
        this.hide();
        pageNavigator.player = player;

        adminPage.init();
        pageNavigator.showPage('admin');
    }

    wireEvents() {
        this.submitEmail.addEventListener('click', () => this.onSubmitEmailClick());
        this.emailInput.addEventListener('input', () => this.onEmailInputInput());
        this.handicapValue.addEventListener('input', () => this.onHandicapValueInput());
        this.adminBtn.addEventListener('click', () => this.onAdminBtnClick());
    }
}

export const splashPage = new SplashPage();
