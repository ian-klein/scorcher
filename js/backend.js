//Facade for client code, and backend library code

'use strict';

export async function submitScore(competition, player, scores) {
    const requestHeaders = {
        'Content-Type': 'application/json'
    };
    
    const requestBody = JSON.stringify({
        competition: competition,
        player: player,
        scores: scores
    });

    const requestUrl = new URL('./.netlify/functions/submit-score', window.location.origin);

    try {
        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: requestHeaders,
            body: requestBody
        });

        if (!response.ok) {
            throw new Error('HTTP error, status = ' + response.status);
        }
    } catch (error) {
        console.error('Error submitting score:', error);
    }
}

export async function resetScore(competition, player) {
    const requestHeaders = {
        'Content-Type': 'application/json'
    };
    
    const requestBody = JSON.stringify({
        competition: competition,
        player: player
    });

    const requestUrl = new URL('./.netlify/functions/reset-score', window.location.origin);

    try {
        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: requestHeaders,
            body: requestBody
        });

        if (!response.ok) {
            throw new Error('HTTP error, status = ' + response.status);
        }
    } catch (error) {
        console.error('Error resetting score:', error);
    }
}

export async function scoreExists(competition, player) {
    const requestHeaders = {
        'Content-Type': 'application/json'
    };
    
    const requestBody = JSON.stringify({
        competition: competition,
        player: player
    });

    const requestUrl = new URL('./.netlify/functions/score-exists', window.location.origin);

    try {
        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: requestHeaders,
            body: requestBody
        });

        if (!response.ok) {
            throw new Error('HTTP error, status = ' + response.status);
        }

        const body = await response.json();
        return body.exists;
    } catch (error) {
        console.error('Error checking score exists:', error);
        return false;
    }
}