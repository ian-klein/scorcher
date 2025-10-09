//Save a score to the filesystem

'use strict';

import { mkdir, writeFile } from 'node:fs/promises';

export default async function submitScore(request, context) {
    const body = await request.json()

    //Make sure the results directory exists
    const today = new Date().toISOString().slice(0, 10);
    const directory = `./results/${today}`;
    mkdir(directory, { recursive: true });

    //Generate a valid file name from the player.name
    const filename = `${directory}/${body.player.name.replace(/[^a-zA-Z0-9]/g, '-')}.json`;

    //Save the score to the filesystem
    await writeFile(filename, JSON.stringify(body.scores.gross), 'utf8');

    //Send the response
    const rbody = {
        status: 'OK',
        filename: filename
    };
    const response = new Response(JSON.stringify(rbody), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(rbody).length
        }
    });
    
    return response;
}
