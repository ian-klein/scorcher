'use strict';

import { getStore } from '@netlify/blobs';
import { storeFor, keyFor } from '../functionsUtil.mjs';

export default async function getResults(request, context) {
    const body = await request.json();

    const storeName = storeFor(body.competition);
    const store = getStore(storeName);

    console.log('====== getResults ======');
    console.log('storeName: ' + storeName);
    
    const { blobs } = await store.list();
    const keys = blobs.map((blob) => blob.key);

    const results = await Promise.all(keys.map(async key => {
        const scorecard = await store.get(key, { type: "json" });
        return scorecard;
    }));

    //Create the results CSV. Each player gets two lines in the CSV: gross scores and points

    const headers = ['id', 'Player', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Out','10', '11', '12', '13', '14', '15', '16', '17', '18', 'Back','Total'];
    
    let csvContent = headers.join(',') + '\n';
    
    // Add scores for each player
    for (const scorecard of results) {
        for (let s = 0; s < scorecard.scores.length; s++) {
            const grossOut = scorecard.scores[s].adjusted.slice(0, 9).reduce((a, b) => a + b, 0);
            const grossBack = scorecard.scores[s].adjusted.slice(9).reduce((a, b) => a + b, 0);
            const grossTotal = grossOut + grossBack;

            const pointsOut = scorecard.scores[s].points.slice(0, 9).reduce((a, b) => a + b, 0);
            const pointsBack = scorecard.scores[s].points.slice(9).reduce((a, b) => a + b, 0);
            const pointsTotal = pointsOut + pointsBack;

            const name = '"' + scorecard.players[s].name + '"';

            const grossRow = [scorecard.id, name, ...scorecard.scores[s].adjusted.slice(0, 9), grossOut, ...scorecard.scores[s].adjusted.slice(9), grossBack, grossTotal].join(',') + '\n';
            const pointsRow = [scorecard.id, name, ...scorecard.scores[s].points.slice(0, 9), pointsOut, ...scorecard.scores[s].points.slice(9), pointsBack, pointsTotal].join(',') + '\n';

            csvContent += grossRow + pointsRow;
        }
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
