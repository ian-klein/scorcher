//Get a submitted score for this plyaer and this competition

'use strict';

import { getStore } from '@netlify/blobs';
import { storeFor, keyFor, revive } from '../functionsUtil.mjs';

export default async function getScores(request, context) {
    const body = await request.json();
    revive(body);

    const storeName = storeFor(body.competition);
    const key = keyFor(body.player);

    console.log('====== getScores ======');
    console.log('storeName: ' + storeName);
    console.log('key: ' + key);

    const store = getStore(storeName);
    const scores = await store.get(key, { type: "json" });

    console.log('scores: ' + JSON.stringify(scores? scores.gross : null));
    
    const response = new Response(JSON.stringify(scores), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(scores).length
        }
    });
    
    return response;
}

