//Logic for the admin page

'use strict';

import { data } from './data.js';
import { backend } from './backend.js';

class AdminPage {
    constructor() {
        this.getResultsBtn = document.getElementById('getResultsBtn');
        this.downloadResultsLink = document.getElementById('downloadResultsLink');
        this.competitionSelect = document.getElementById('competitionSelect');
        this.playersTableBody = document.getElementById('playersTableBody');
        this.uploadPlayersBtn = document.getElementById('uploadPlayersBtn');
        this.downloadPlayersBtn = document.getElementById('downloadPlayersBtn');
        this.playersFileInput = document.getElementById('playersFileInput');
        this.downloadPlayersLink = document.getElementById('downloadPlayersLink');
        this.adminsTableBody = document.getElementById('adminsTableBody');
        this.uploadAdminsBtn = document.getElementById('uploadAdminsBtn');
        this.downloadAdminsBtn = document.getElementById('downloadAdminsBtn');
        this.adminFileInput = document.getElementById('adminFileInput');
        this.downloadAdminLink = document.getElementById('downloadAdminLink');
        this.diaryTableBody = document.getElementById('diaryTableBody');
        this.uploadDiaryBtn = document.getElementById('uploadDiaryBtn');
        this.downloadDiaryBtn = document.getElementById('downloadDiaryBtn');
        this.diaryFileInput = document.getElementById('diaryFileInput');
        this.downloadDiaryLink = document.getElementById('downloadDiaryLink');
    }

    renderScores() {
        const diary = data.getEventDiary();

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

        this.getResultsBtn.disabled = true;
    }

    renderPlayers() {
        const players = data.getPlayers();
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
        const admins = data.getAdmins();
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
        const diary = data.getEventDiary();
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
        this.competitionSelect.addEventListener('change', () => this.onCompetitionSelectChange());
        this.getResultsBtn.addEventListener('click', () => this.onGetResultsBtnClick());
        this.uploadPlayersBtn.addEventListener('click', () => this.onUploadPlayersBtnClick());
        this.playersFileInput.addEventListener('change', () => this.onPlayersFileInputChange());
        this.downloadPlayersBtn.addEventListener('click', () => this.onDownloadPlayersBtnClick());
        this.uploadAdminsBtn.addEventListener('click', () => this.onUploadAdminsBtnClick());
        this.adminFileInput.addEventListener('change', () => this.onAdminFileInputChange());
        this.downloadAdminsBtn.addEventListener('click', () => this.onDownloadAdminsBtnClick());
        this.uploadDiaryBtn.addEventListener('click', () => this.onUploadDiaryBtnClick());
        this.diaryFileInput.addEventListener('change', () => this.onDiaryFileInputChange());
        this.downloadDiaryBtn.addEventListener('click', () => this.onDownloadDiaryBtnClick());
    }

    init() {
        this.wireEvents();
        this.renderScores();
        this.renderPlayers();
        this.renderAdmins();
        this.renderDiary();
    }

    onCompetitionSelectChange() {
        this.getResultsBtn.disabled = !this.competitionSelect.value || this.competitionSelect.value === '';
    }

    async onGetResultsBtnClick() {  
        const date = new Date(this.competitionSelect.value);
        const competition = data.getCompetition(date);
        const fileName = `results-${date.toISOString().slice(0, 10)}.csv`;

        const response = await backend.getResults(competition);
        this.download(response, fileName);
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
                await backend.uploadFile('players', JSON.stringify(data));
            };
            reader.readAsText(file);
        }
    }

    onDownloadPlayersBtnClick() {
        this.downloadReferenceFile('players');
    }

    onUploadAdminsBtnClick() {
        this.adminFileInput.click();
    }

    onAdminFileInputChange() {
        const file = this.adminFileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = JSON.parse(e.target.result);
                await backend.uploadFile('admin', JSON.stringify(data));
            };
            reader.readAsText(file);
        }
    }

    onDownloadAdminsBtnClick() {
        this.downloadReferenceFile('admin');
    }

    onUploadDiaryBtnClick() {
        this.diaryFileInput.click();
    }

    onDiaryFileInputChange() {
        const file = this.diaryFileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = JSON.parse(e.target.result);
                await backend.uploadFile('diary', JSON.stringify(data));
            };
            reader.readAsText(file);
        }
    }

    onDownloadDiaryBtnClick() {
        this.downloadReferenceFile('diary');
    }

    async downloadReferenceFile(which) {
        const response = await backend.downloadFile(which);
        this.download(response, which + '.json');
    }

    async download(response, fileName) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

export const adminPage = new AdminPage();