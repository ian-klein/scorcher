//Logic for the admn page

'use strict';

import { pageNavigator } from './pageNavigator.js';
import { getCompetition, getPlayers, getAdmins, getEventDiary } from './data.js';
import { uploadFile, getScores } from './backend.js';



class AdminPage {
    constructor() {
        this.getScoresBtn = document.getElementById('getScoresBtn');
        this.competitionSelect = document.getElementById('competitionSelect');
        this.playersTableBody = document.getElementById('playersTableBody');
        this.uploadPlayersBtn = document.getElementById('uploadPlayersBtn');
        this.downloadPlayersBtn = document.getElementById('downloadPlayersBtn');
        this.playersFileInput = document.getElementById('playersFileInput');
        this.downloadPlayersLink = document.getElementById('downloadPlayersLink');
        this.adminsTableBody = document.getElementById('adminsTableBody');
        this.uploadAdminsBtn = document.getElementById('uploadAdminsBtn');
        this.downloadAdminsBtn = document.getElementById('downloadAdminsBtn');
        this.diaryTableBody = document.getElementById('diaryTableBody');
        this.uploadDiaryBtn = document.getElementById('uploadDiaryBtn');
        this.downloadDiaryBtn = document.getElementById('downloadDiaryBtn');
    }

    renderScores() {
        const diary = getEventDiary();

        const today = new Date();
        const competitions = diary.filter(e => e.date <= today && e.type !== 'other').slice(0, 3);
        for (const c of competitions) {
            const textContent = c.date.toISOString().slice(0, 10) + ' ' + c.name;
            const value = c.date.toISOString();
            const option = document.createElement('option');
            option.value = value;
            option.textContent = textContent;
            this.competitionSelect.appendChild(option);
        }

        this.getScoresBtn.disabled = true;
    }

    renderPlayers() {
        const players = getPlayers();
        this.playersTableBody.innerHTML = '';
        for (const player of players) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${player.firstName}</td>
                <td>${player.lastName}</td>
                <td>${player.gender || 'male'}</td>
                <td>${player.email}</td>
            `;
            this.playersTableBody.appendChild(row);
        }
    }

    renderAdmins() {
        const admins = getAdmins();
        this.adminsTableBody.innerHTML = '';
        for (const email of admins) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${email}</td>
            `;
            this.adminsTableBody.appendChild(row);
        }
    }

    renderDiary() {
        const diary = getEventDiary();
        this.diaryTableBody.innerHTML = '';
        for (const event of diary) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${event.date.toISOString().split('T')[0]}</td>
                <td>${event.name}</td>
                <td>${event.type}</td>
            `;
            this.diaryTableBody.appendChild(row);
        }
    }

    wireEvents() {
        this.getScoresBtn.addEventListener('click', () => this.onGetScoresBtnClick());
        this.uploadPlayersBtn.addEventListener('click', () => this.onUploadPlayersBtnClick());
        this.playersFileInput.addEventListener('change', () => this.onPlayersFileInputChange());
        this.downloadPlayersBtn.addEventListener('click', () => this.onDownloadPlayersBtnClick());
        this.uploadAdminsBtn.addEventListener('click', () => this.onUploadAdminsBtnClick());
        this.downloadAdminsBtn.addEventListener('click', () => this.onDownloadAdminsBtnClick());
        this.uploadDiaryBtn.addEventListener('click', () => this.onUploadDiaryBtnClick());
        this.downloadDiaryBtn.addEventListener('click', () => this.onDownloadDiaryBtnClick());
        this.competitionSelect.addEventListener('change', () => this.onCompetitionSelectChange());
    }

    init() {
        this.wireEvents();
        this.renderScores();
        this.renderPlayers();
        this.renderAdmins();
        this.renderDiary();
    }

    onCompetitionSelectChange() {
        this.getScoresBtn.disabled = !this.competitionSelect.value || this.competitionSelect.value === '';
    }

    onGetScoresBtnClick() {
        const date = new Date(this.competitionSelect.value);
        const competition = getCompetition(date);
        getScores(competition);
    }

    onUploadPlayersBtnClick() {
        this.playersFileInput.click();
    }

    onPlayersFileInputChange() {
        const file = this.playersFileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = JSON.parse(e.target.result);
                await uploadFile('players', JSON.stringify(data));
            };
            reader.readAsText(file);
        }
    }

    onDownloadPlayersBtnClick() {
        this.downloadPlayersLink.click();
    }

    onUploadAdminsBtnClick() {
    }ß

    onDownloadAdminsBtnClick() {
    }

    onUploadDiaryBtnClick() {
    }

    onDownloadDiaryBtnClick() {
    }
}

export const adminPage = new AdminPage();