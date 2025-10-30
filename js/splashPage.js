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
        this.akqControls = document.getElementById('akqControls');
        this.aceHole = document.getElementById('aceHole');
        this.kingHole = document.getElementById('kingHole');
        this.queenHole = document.getElementById('queenHole');
        this.testSelect = document.getElementById('testSelect'); //For testing only

        this.competition = null;

        this.wireEvents();
    }

    isTesting() {
        return this.emailInput.value === 'ian.klein14@gmail.com';
    }

    wireEvents() {
        this.continueBtn.addEventListener('click', () => this.onContinueBtnClick());
        this.emailInput.addEventListener('input', () => this.onEmailInputInput());
        this.handicapValue.addEventListener('input', () => this.onHandicapValueInput());
        this.adminBtn.addEventListener('click', () => this.onAdminBtnClick());
        this.testSelect.addEventListener('change', () => this.onTestSelectChange());
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
        if (!this.competition.isSupported()) {
            this.displayMessage('Supported competitions are ' + Competition.supportedTypes().join(', ') + '. For this competition just put your signed, completed card in the box');
            this.continueBtn.disabled = !this.isTesting();
        } else {
            //Warn if the competition is in the past
            const today = new Date();
            if (this.competition.date.toISOString().slice(0, 10) !== today.toISOString().slice(0, 10)) {
                this.displayMessage('This competition has already taken place, so no need to enter scores now');
            }

            //Must have email and PH in order to score
            const email = this.emailInput.value.trim();
            const ph = this.handicapValue.value.trim();
            this.continueBtn.disabled = !email || email.length === 0 || (this.competition.isIndividualCompetition() && (!ph || ph.length === 0));
        }
    }


    renderButtons() {
        this.renderAdminButton();
        this.renderContinueButton();
    }

    renderCompetitionName() {
        this.splashCompetitionName.textContent = data.competitionDisplayName(this.competition);
    }

    renderPlayer() {
        //Get email & PH from local storage
        const raw = localStorage.getItem(PLAYER_STORAGE_KEY);
        if (raw) {
            const storedPlayer = JSON.parse(raw);

            this.emailInput.value = storedPlayer.email;
            this.handicapValue.value = storedPlayer.ph;            
        }

        if (this.competition.isIndividualCompetition()) {
            this.handicapControls.style.display = 'flex';
        } else {
            this.handicapControls.style.display = 'none';
        }

        if (this.competition.type === Competition.Type.AKQ) {
            this.akqControls.style.display = 'flex';
        } else {
            this.akqControls.style.display = 'none';
        }
    }

    renderTestSelect() {
        if (this.isTesting()) {
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

            if (this.competition.type === Competition.Type.AKQ) {
                if (this.aceHole.value === '' || this.kingHole.value === '' || this.queenHole.value === '') {
                    alert('Please choose all three Ace, King and Queen holes');
                    return;
                }

                player.akq.ace = Number(this.aceHole.value);
                player.akq.king = Number(this.kingHole.value);
                player.akq.queen = Number(this.queenHole.value);

                if (player.akq.ace === player.akq.king || player.akq.ace === player.akq.queen || player.akq.king === player.akq.queen) {
                    alert('Ace, King and Queen holes must be different');
                    return;
                }
            }

            pageNavigator.competition = this.competition;
            pageNavigator.players = [ player ]; //Even for teams, pass this player as the first one!

            this.hide();
            if (this.competition.isIndividualCompetition()) {
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

    onTestSelectChange() {
        this.competition.type = this.testSelect.value;
        this.renderPlayer();
        this.renderButtons();
    }

    init() {
        this.competition = data.getCompetition();

        this.renderCompetitionName();
        this.renderPlayer();
        this.renderButtons();
        this.renderTestSelect();
        this.splashControls.style.display = 'block';
    }
}

export const splashPage = new SplashPage();
