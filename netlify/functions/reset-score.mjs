//Delete the score for this player and this competition

'use strict';

import { unlink } from 'node:fs/promises';
import { competitionDirectoryPath, playerFileName, revive } from '../functionsUtil.mjs';

export default async function resetScore(request, context) {
    const body = await request.json();
    revive(body);

    const directoryPath = competitionDirectoryPath(body.competition);
    const filename = `${directoryPath}/${playerFileName(body.player)}`;

    await unlink(filename);

    //Send the response
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