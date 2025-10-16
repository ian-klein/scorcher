//Download a reference data file from the server

'use strict';

import { getStore } from '@netlify/blobs';

export default async function downloadFile(request, context) {
    const body = await request.json();

    const which = body.which; // players, admin or diary

    console.log('====== downloadFile ======');
    console.log('which: ' + which);

    if (which !== 'players' && which !== 'admin' && which !== 'diary') {
        throw new Error('Invalid which: "' + which + '"');
    }

    const store = getStore('data');
    const data = await store.get(which, { type: "json" });

    if (!data) {
        return new Response(which + ': data not found', { status: 404 });
    }

    return new Response(data, {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Content-Length": data.length,
            "Content-Disposition": `attachment; filename="${which}.json"`
        }
    });
}
