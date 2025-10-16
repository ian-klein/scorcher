// Logic for the splash screen (which also prompts for email if we did not already have it)
'use strict';

import { data } from './data.js';
import { pageNavigator } from './pageNavigator.js';
import { scoreEntryPage } from './scoreEntryPage.js';
import { adminPage } from './adminPage.js';

const PLAYER_STORAGE_KEY= 'player_v1'

class SplashPage {
    constructor() {
        this.splashScreen = document.getElementById('splashScreen');
        this.splashControls = document.getElementById('splashControls');
        this.splashCompetitionName = document.getElementById('splashCompetitionName');
        this.emailInput = document.getElementById('emailInput');
        this.handicapValue = document.getElementById('handicapValue');
        this.emailInputGroup = document.getElementById('emailInputGroup');
        this.continueBtn = document.getElementById('continueBtn');
        this.splashMessage = document.getElementById('splashMessage');                                                                                                                                                                                                                      
        this.adminBtn = document.getElementById('adminBtn');
    }

    renderAdminButton() {
        const email = this.emailInput.value.trim();
        const ph = this.handicapValue.value.trim();
        const player = data.getPlayer(email,ph);
        const isAdmin = player && player.admin;

        if (isAdmin) {
            this.adminBtn.style.display = 'block';
        } else {
            this.adminBtn.style.display = 'none';
        }
    }

    renderSubmitButton() {
        //Only score Stableford and strokeplay competitions
        const comp = data.getCompetition();
        if (comp.type === 'other') {
            this.displayMessage('Only use this app for individual Stableford or strokeplay competitions. For this competition just put your signed, completed card in the box');
            this.continueBtn.disabled = true;
        } else {
            //Warn if the competition is in the past
            const today = new Date();
            if (comp.date.toISOString().slice(0, 10) !== today.toISOString().slice(0, 10)) {
                this.displayMessage('This competition has already taken place, so probably entering scores now is awaste of your time!');
            }

            //Must have email and PH in order to score
            const email = this.emailInput.value.trim();
            const ph = this.handicapValue.value.trim();
            this.continueBtn.disabled = !email || email.length === 0 || !ph || ph.length === 0;
        }
    }


    renderButtons() {
        this.renderAdminButton();
        this.renderSubmitButton();
    }

    renderCompetitionName() {
        const comp = data.getCompetition();
        this.splashCompetitionName.textContent = data.competitionDisplayName(comp);
    }

    renderPlayer() {
        //Get email & PH from local storage
        const raw = localStorage.getItem(PLAYER_STORAGE_KEY);
        if (raw) {
            const storedPlayer = JSON.parse(raw);

            this.emailInput.value = storedPlayer.email;
            this.handicapValue.value = storedPlayer.ph;            
        }
    }

    init() {
        this.renderCompetitionName();
        this.renderPlayer();
        this.renderButtons();
        this.wireEvents();
    }

    hide() {
        this.splashScreen.style.display = 'none';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    displayMessage(message) {
        this.splashMessage.textContent = message;
    }

    onContinueBtnClick() {
        const email = this.emailInput.value.trim();
        const ph = this.handicapValue.value.trim();
        if (email && ph) {
            const player = data.getPlayer(email,ph);
            if (!player) {  
                alert('Email address is not in the player database');
                return;
            }

            const storedPlayer = {
                email: email,
                ph: ph
            }
            localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(storedPlayer));

            pageNavigator.player = player;
            pageNavigator.competition = data.getCompetition();
    
            this.hide();
            scoreEntryPage.init();
            pageNavigator.showPage('scoreEntry');
        }
    }

    onEmailInputInput() {
        this.renderButtons();
    }

    onHandicapValueInput() {
        this.renderSubmitButton();
    }

    onAdminBtnClick() {
        const email = this.emailInput.value.trim();
        const ph = this.handicapValue.value.trim();
        const player = data.getPlayer(email,ph);
        this.hide();
        pageNavigator.player = player;

        adminPage.init();
        pageNavigator.showPage('admin');
    }

    wireEvents() {
        this.continueBtn.addEventListener('click', () => this.onContinueBtnClick());
        this.emailInput.addEventListener('input', () => this.onEmailInputInput());
        this.handicapValue.addEventListener('input', () => this.onHandicapValueInput());
        this.adminBtn.addEventListener('click', () => this.onAdminBtnClick());
    }
}

export const splashPage = new SplashPage();
