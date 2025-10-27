// Logic for the splash screen (which also prompts for email if we did not already have it)
'use strict';

import { data } from './data.js';
import { pageNavigator } from './pageNavigator.js';
import { scoreEntryPage } from './scoreEntryPage.js';
import { adminPage } from './adminPage.js';
import { teamPage } from './teampage.js';
import { Competition } from './schema.js';

const PLAYER_STORAGE_KEY= 'player_v1'

class SplashPage {
    constructor() {
        this.splashScreen = document.getElementById('splashScreen');
        this.splashControls = document.getElementById('splashControls');
        this.handicapControls = document.getElementById('handicapControls');
        this.splashCompetitionName = document.getElementById('splashCompetitionName');
        this.emailInput = document.getElementById('emailInput');
        this.handicapValue = document.getElementById('handicapValue');
        this.emailInputGroup = document.getElementById('emailInputGroup');
        this.continueBtn = document.getElementById('continueBtn');
        this.splashMessage = document.getElementById('splashMessage');                                                                                                                                                                                                                      
        this.adminBtn = document.getElementById('adminBtn');
        this.testSelect = document.getElementById('testSelect');

        this.wireEvents();
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

    renderContinueButton() {
        //Only score supported competitions
        const comp = data.getCompetition();
        if (!comp.isSupported()) {
            this.displayMessage('Supported competitions are ' + Competition.supportedTypes.join(', ') + '. For this competition just put your signed, completed card in the box');
            this.continueBtn.disabled = true;
        } else {
            //Warn if the competition is in the past
            const today = new Date();
            if (comp.date.toISOString().slice(0, 10) !== today.toISOString().slice(0, 10)) {
                this.displayMessage('This competition has already taken place, so no need to enter scores now');
            }

            //Must have email and PH in order to score
            const email = this.emailInput.value.trim();
            const ph = this.handicapValue.value.trim();
            this.continueBtn.disabled = !email || email.length === 0 || (comp.isIndividualCompetition() && (!ph || ph.length === 0));
        }
    }


    renderButtons() {
        this.renderAdminButton();
        this.renderContinueButton();
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

        const comp = data.getCompetition();
        if (comp.isIndividualCompetition()) {
            this.handicapControls.style.display = 'flex';
        } else {
            this.handicapControls.style.display = 'none';
        }
    }

    renderTestSelect() {
        const email = this.emailInput.value.trim();
        if (email === 'ian.klein14@gmail.com') {
            this.testSelect.style.display = 'block';
            for (const type of Object.values(Competition.Type)) {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                this.testSelect.appendChild(option);
            }
        } else {
            this.testSelect.style.display = 'none';
        }
    }                

    init() {
        this.renderCompetitionName();
        this.renderPlayer();
        this.renderButtons();
        this.renderTestSelect();
        this.splashControls.style.display = 'block';
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
        if (email) {
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

            const comp = data.getCompetition();
            //For testing only ...
            if (this.testSelect.style.display === 'block') {
                comp.type = this.testSelect.value;
            }
            pageNavigator.competition = comp;
            pageNavigator.players = [ player ]; //Even for teams, pass this player as the first one!

            this.hide();
            if (comp.isIndividualCompetition()) {
                scoreEntryPage.init();
                pageNavigator.showPage('scoreEntry');
            } else {
                teamPage.init();
                pageNavigator.showPage('team');
            }            
        }
    }

    onEmailInputInput() {
        this.renderButtons();
        this.renderTestSelect();
    }

    onHandicapValueInput() {
        this.renderContinueButton();
    }

    onAdminBtnClick() {
        this.hide();
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
