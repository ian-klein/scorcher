//Delete the score for this player and this competition

'use strict';

import { getStore } from '@netlify/blobs';
import { storeFor, keyFor } from '../functionsUtil.mjs';

//The request body is a competition and a scorecard id
export default async function resetScorecard(request, context) {
    const body = await request.json();

    const storeName = storeFor(body.competition);
    const key = keyFor(body.id);

    console.log('====== resetScorecard ======');
    console.log('storeName: ' + storeName);
    console.log('key: ' + key);

    const store = getStore(storeName);
    await store.delete(key);

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