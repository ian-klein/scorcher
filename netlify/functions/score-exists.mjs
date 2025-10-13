//Check to see if a score exists for this plyaer and this competition

'use strict';

import { access } from 'node:fs/promises';
import { competitionDirectoryPath, playerFileName, revive } from '../functionsUtil.mjs';

export default async function scoreExists(request, context) {
    const body = await request.json();
    revive(body);

    const directoryPath = competitionDirectoryPath(body.competition);
    const filename = `${directoryPath}/${playerFileName(body.player)}`;
    
    let exists = false;
    try {
        await access(filename);
        exists = true;
    } catch (error) {
        exists = false;
    }
    
    //Send the response
    const rbody = {
        status: 'OK',
        filename: filename,
        exists: exists
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


