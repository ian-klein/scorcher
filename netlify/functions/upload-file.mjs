//Upload a reference data file to the server

'use strict';

import { getStore } from '@netlify/blobs';

export default async function uploadFile(request, context) {
    const body = await request.json();

    const which = body.which; // players, admin or diary
    const contents = body.contents

    if (isDebug()) {
        console.log('====== uploadFile ======');
        console.log('which: ' + which);
    }

    if (which !== 'players' && which !== 'admin' && which !== 'diary') {
        throw new Error('Invalid which: "' + which + '"');
    }

    const store = getStore('data');
    await store.set(which, JSON.stringify(contents));
    
    //Send the response
    const rbody = {
        status: 'OK',
        storeName: 'data',
        key: which
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

