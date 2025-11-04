//Library code for the UI

'use strict';

class UI {
    constructor() {
    }

    //Render the player header for the score entry and review pages
    renderPlayerHeader(players, playerHeader) {
        const labels = ['A:', 'B:', 'C:', 'D:'];

        if (players.length === 1 && players[0].team) {
            //This is a team with a single score
            for (let i = 0; i < 4; i++) {
                if (i < players[0].team.length) {
                    playerHeader[i].label.textContent = labels[i];
                    playerHeader[i].name.textContent = players[0].team[i].name;
                    playerHeader[i].ph.textContent = ''
                }
                else {
                    playerHeader[i].label.textContent = '';
                    playerHeader[i].name.textContent = '';
                    playerHeader[i].ph.textContent = '';
                }
            }
            //Display the team handicap where player D's handicap would be
            if (players[0].team.length < 4) {
                playerHeader[3].name.textContent = 'TH:';
                playerHeader[3].name.style.textAlign = 'right';
            }
            else {
                playerHeader[3].name.style.textAlign = 'left';
            }
            playerHeader[3].ph.textContent = players[0].ph;
        }
        else {
            for (let i = 0; i < 4; i++) {
                if (i < players.length) {
                    playerHeader[i].label.textContent = labels[i];
                    playerHeader[i].name.textContent = players[i].name;
                    playerHeader[i].ph.textContent = players[i].ph;
                }
                else {
                    playerHeader[i].label.textContent = '';
                    playerHeader[i].name.textContent = '';
                    playerHeader[i].ph.textContent = '';
                }
            }
        }
    }
}

export const ui = new UI();