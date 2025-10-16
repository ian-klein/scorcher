'use strict';

import { getStore } from '@netlify/blobs';
import { storeFor, keyFor, revive } from '../functionsUtil.mjs';

export default async function getResults(request, context) {
    const body = await request.json();
    revive(body);

    const storeName = storeFor(body.competition);
    const store = getStore(storeName);

    console.log('====== getResults ======');
    console.log('storeName: ' + storeName);
    
    const { blobs } = await store.list();
    const keys = blobs.map((blob) => blob.key);

    const results = await Promise.all(keys.map(async key => {
        const scores = await store.get(key, { type: "json" });
        return scores;
    }));

    //Create the results CSV. Each player gets two lines in the CSV: gross scores and points

    const headers = ['Player', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Out','10', '11', '12', '13', '14', '15', '16', '17', '18', 'Back','Total'];
    
    let csvContent = headers.join(',') + '\n';
    
    // Add scores for each player
    for (const scores of results) {
        const grossOut = scores.adjusted.slice(0, 9).reduce((a, b) => a + b, 0);
        const grossBack = scores.adjusted.slice(9).reduce((a, b) => a + b, 0);
        const grossTotal = grossOut + grossBack;

        const pointsOut = scores.points.slice(0, 9).reduce((a, b) => a + b, 0);
        const pointsBack = scores.points.slice(9).reduce((a, b) => a + b, 0);
        const pointsTotal = pointsOut + pointsBack;

        const name = '"' + scores.name + '"';

        const grossRow = [name, ...scores.gross.slice(0, 9), grossOut, ...scores.gross.slice(9), grossBack, grossTotal].join(',') + '\n';
        const pointsRow = [name, ...scores.points.slice(0, 9), pointsOut, ...scores.points.slice(9), pointsBack, pointsTotal].join(',') + '\n';

        csvContent += grossRow + pointsRow;
    }

    const fileName = storeName + '.csv';

    const response = new Response(csvContent, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Length': csvContent.length
        }
    });
    
    return response;
}
