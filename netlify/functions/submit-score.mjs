//Save a score to the results blob store for this competiton

'use strict';

import { getStore } from '@netlify/blobs';
import { storeFor, keyFor, revive } from '../functionsUtil.mjs';

export default async function submitScore(request, context) {
    const body = await request.json();
    revive(body);

    const storeName = storeFor(body.competition);
    const key = keyFor(body.player);

    const store = getStore(storeName);
    store.set(key, JSON.stringify(body.scores));

    //Send the response
    const rbody = {
        status: 'OK',
        storeName: storeName,
        key: key
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
