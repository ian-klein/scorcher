//Facade for client code to call server functions

'use strict';

class Backend {
    constructor() {
    }
    
    //Submit the score for a player in a competition
    async submitScores(competition, player, scores) {
        const response = await this.#postRequest('submit-scores', {
            competition: competition,
            player: player,
            scores: scores
        });

        if (response && response.status === 200) {
            return true;
        } else {
            return false;
        }
    }

    //Delete a score for a player in a competition (not currently used)
    async resetScore(competition, player) {
        const response = await this.#postRequest('reset-scores', {
            competition: competition,
            player: player
        });

        if (response && response.status === 200) {
            return true;
        } else {
            return false;
        }
    }

    //Get the submitted scores for a player in a competition
    async getScores(competition, player) {
        const response = await this.#postRequest('get-scores', {
            competition: competition,
            player: player
        });

        if (response && response.status === 200) {
            const scores = await response.json();
            return scores;
        } else {
            return null;
        }
    }

    //Email the submitted scores for a player in a competition (not currently used)
    async emailScores(competition, player) {
        const response = await this.#postRequest('email-scores', {
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

