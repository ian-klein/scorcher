//Facade for client code to call server functions

'use strict';

class Backend {
    constructor() {
        this.spinnerOverlay = document.getElementById('spinnerOverlay');
    }

    showSpinner() {
        this.spinnerOverlay.style.display = 'flex';
    }

    hideSpinner() {
        this.spinnerOverlay.style.display = 'none';
    }

    //Submit the score for a player in a competition
    async submitScorecard(scorecard) {
        const response = await this.#postRequest('submit-scorecard', scorecard);

        if (response && response.status === 200) {
            return true;
        } else {
            return false;
        }
    }

    //Delete a score for a player in a competition (not currently used)
    async resetScorecard(competition, id) {
        const response = await this.#postRequest('reset-scorecard', {
            competition: competition,
            id: id
        });

        if (response && response.status === 200) {
            return true;
        } else {
            return false;
        }
    }

    //Get the submitted scores for a player in a competition
    async getScorecard(competition, id) {
        const response = await this.#postRequest('get-scorecard', {
            competition: competition,
            id: id
        });

        if (response && response.status === 200) {
            const scorecard = await response.json();
            return scorecard;
        } else {
            return null;
        }
    }

    //Email the submitted scores for a player in a competition (not currently used)
    async emailScorecard(competition, player) {
        const response = await this.#postRequest('email-scorecard', {
            competition: competition,
            player: player
        });

        if (response && response.status === 200) {
            return true;
        } else {
            return false;
        }
    }

    //Upload a file to the blob store
    async uploadFile(which, contents) {
        const response = await this.#postRequest('upload-file', {
            which: which,
            contents: contents
        });

        if (response && response.status === 200) {
            return true;
        } else {
            return false;
        }
    }

    //Download a file from the blob store
    async downloadFile(which) {
        const response = await this.#postRequest('download-file', {
            which: which
        });
        return response;
    }

    //Get the results for a competition
    async getResults(competition) {
        const response = await this.#postRequest('get-results', {
            competition: competition
        });
        return response;
    }

    //Read a reference data file from the blob store
    async readFile(which) {
        const response = await this.#postRequest('read-file', {
            which: which
        });
        if (response && response.status === 200) {
            const results = await response.json();
            return results;
        } else {
            return null;
        }
    }

    //Get the tester email address (for testing only)
    async getTestEmail() {
        const response = await this.#postRequest('get-test-email', {});
        if (response && response.status === 200) {
            const results = await response.json();
            return results.email;
        } else {
            return null;
        }
    }

    //POST an HTTP request to the server (run a Netlify function)
    async #postRequest(urlSuffix, body) {
        const requestHeaders = {
            'Content-Type': 'application/json'
        };
        
        const requestBody = JSON.stringify(body);
        const requestUrl = new URL('./.netlify/functions/' + urlSuffix, window.location.origin);

        try {
            const response = await fetch(requestUrl, {
                method: 'POST',
                headers: requestHeaders,
                body: requestBody
            });
            return response;
        } catch (error) {
            console.error('Error on ' + urlSuffix + ':', error);
            return null;
        }
    }
}

export const backend = new Backend();

