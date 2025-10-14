//Upload a reference data file to the server

'use strict';

import { writeFile } from 'node:fs/promises';

export default async function submitScore(request, context) {
    const body = await request.json();

    const which = body.which; // players, admin or diary
    const contents = body.contents

    if (which !== 'players' && which !== 'admins' && which !== 'diary') {
        throw new Error('Invalid which: "' + which + '"');
    }

    const fileName = `./data/${which}.json`;

    await writeFile(fileName, contents, 'utf8');

    //Send the response
    const rbody = {
        status: 'OK',
        filename: fileName
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

