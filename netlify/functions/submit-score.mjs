//Save a score to the filesystem

'use strict';

import { mkdir, writeFile } from 'node:fs/promises';
import { directoryFor, fileNameFor, revive } from '../functionsUtil.mjs';

export default async function submitScore(request, context) {
    const body = await request.json();
    revive(body);

    //Make sure the results directory exists
    const directoryPath = directoryFor(body.competition);
    mkdir(directoryPath, { recursive: true });

    //Generate a valid file name from the player.name
    const filename = `${directoryPath}/${fileNameFor(body.player)}`;

    //Save the score to the filesystem
    await writeFile(filename, JSON.stringify(body.scores), 'utf8');

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
