//Get a submitted score for this player and this competition

'use strict';

import { getStore } from '@netlify/blobs';
import { storeFor, keyFor } from '../functionsUtil.mjs';

//The request body is a competition and a scorecard id
export default async function getScores(request, context) {
    const body = await request.json();

    const storeName = storeFor(body.competition);
    const key = keyFor(body.id);

    console.log('====== getScorecard ======');
    console.log('storeName: ' + storeName);
    console.log('key: ' + key);

    const store = getStore(storeName);
    const scorecard = await store.get(key, { type: "json" });

    console.log('scorecard: ' + JSON.stringify(scorecard));
    
    const response = new Response(JSON.stringify(scorecard), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(scorecard).length
        }
    });
    
    return response;
}

