//Get a submitted score for this plyaer and this competition

'use strict';

import { readFile } from 'node:fs/promises';
import { directoryFor, fileNameFor, revive } from '../functionsUtil.mjs';

export default async function getScores(request, context) {
    const body = await request.json();
    revive(body);

    const directoryPath = directoryFor(body.competition);
    const filename = `${directoryPath}/${fileNameFor(body.player)}`;
    
    let scores = null;
    try {
        const fileContents = await readFile(filename, 'utf8');
        scores = JSON.parse(fileContents);
    } catch (error) {
        scores = null;
    }
    
    //Send the response
    const rbody = {
        status: 'OK',
        scores: scores
    };
    console.log(rbody);    
    const response = new Response(JSON.stringify(rbody), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(rbody).length
        }
    });
    
    return response;
}

