//Delete the score for this player and this competition

'use strict';

import { getStore } from '@netlify/blobs';
import { storeFor, keyFor, revive } from '../functionsUtil.mjs';

export default async function resetScores(request, context) {
    const body = await request.json();
    revive(body);

    const storeName = storeFor(body.competition);
    const key = keyFor(body.player);

    const store = getStore(storeName);
    store.delete(key);

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