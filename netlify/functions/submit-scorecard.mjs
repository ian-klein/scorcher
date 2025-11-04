//Save a score to the results blob store for this competiton

'use strict';

import { getStore } from '@netlify/blobs';
import { storeFor, keyFor } from '../functionsUtil.mjs';

//The request body is a scorecard
export default async function submitScorecard(request, context) {
    const scorecard = await request.json();

    const storeName = storeFor(scorecard.competition);
    const key = keyFor(scorecard.id);

    console.log('====== submitScorecard ======');
    console.log('storeName: ' + storeName);
    console.log('key: ' + key);

    const store = getStore(storeName);
    await store.set(key, JSON.stringify(scorecard));

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
