//Facade for client code, and backend library code

'use strict';

export async function submitScore(competition, player, scores) {
    const response = await postRequest('submit-score', {
        competition: competition,
        player: player,
        scores: scores
    });
}

export async function resetScore(competition, player) {
    const response = await postRequest('reset-score', {
        competition: competition,
        player: player
    });
}

export async function getScores(competition, player) {
    const response = await postRequest('get-scores', {
        competition: competition,
        player: player
    });
    const results = await response.json();
    return results.scores;
}

export async function emailScores(competition, player) {
    const response = await postRequest('email-scores', {
        competition: competition,
        player: player
    });
}

export async function uploadFile(which, contents) {
    const response = await postRequest('upload-file', {
        which: which,
        contents: contents
    });
}

export async function getResults(competition) {
    const response = await postRequest('get-results', {
        competition: competition
    });
}

async function postRequest(urlSuffix, body) {
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

        if (!response.ok) {
            throw new Error('HTTP error, status = ' + response.status);
        }

        return response;
    } catch (error) {
        console.error('Error on ' + urlSuffix + ':', error);
    }
}

