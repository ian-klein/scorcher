'use strict';

import { getStore } from '@netlify/blobs';
import { storeFor, keyFor } from '../functionsUtil.mjs';
import { Competition } from '../../js/schema.js';

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

    const headers = ['id', 'Player', 'PH','1', '2', '3', '4', '5', '6', '7', '8', '9', 'Out','10', '11', '12', '13', '14', '15', '16', '17', '18', 'Back','Total', 'Nett'];
    
    let csvContent = headers.join(',') + '\n';
    
    // Add scores for each player
    for (const scorecard of results) {
        const comp = new Competition(scorecard.competition);

        //Add a row for the gross scores of each player
        for (let s = 0; s < scorecard.scores.length; s++) {
            const name = '"' + scorecard.players[s].name + '"';
            const ph = scorecard.players[s].ph;
            const gross = comp.scoring() === Competition.Type.STABLEFORD ? scorecard.scores[s].adjusted : scorecard.scores[s].gross;

            const grossOut = scorecard.scores[s].adjusted.slice(0, 9).reduce((a, b) => a + b, 0);
            const grossBack = scorecard.scores[s].adjusted.slice(9).reduce((a, b) => a + b, 0);
            const grossTotal = grossOut + grossBack;

            let grossRow = '';
            if (comp.type === Competition.Type.FLAG) {
                let shotsRemaining = Number(scorecard.players[s].tees.parTotal) + Number(scorecard.players[s].ph);
                for (let hole = 1; hole <= 18 && shotsRemaining > 0; hole++) {
                    const shotsConsumed = scorecard.scores[s].gross[hole-1];
                    if (shotsConsumed === 'X') {
                        shotsRemaining = -1;
                    } else {
                        shotsRemaining -= Number(shotsConsumed);
                    }
                }

                const result = shotsRemaining > 0 ? shotsRemaining : scorecard.flag;
                grossRow = [scorecard.id, name, ph, ...gross.slice(0, 9), '', ...gross.slice(9), '', '', result].join(',') + '\n';
            } else {
                grossRow = [scorecard.id, name, ph, ...gross.slice(0, 9), grossOut, ...gross.slice(9), grossBack, grossTotal, grossTotal - scorecard.players[s].ph].join(',') + '\n';
            }

            csvContent += grossRow;
        }

        //Add a row for the points of stableford comp, or the tee shots of a scramble
        let name = scorecard.players[0].name;
        let ph = scorecard.players[0].ph;
        let points = scorecard.scores[0].points;

        if (scorecard.scores.length > 1) {
            name = scorecard.id;
            points = scorecard.points;
            ph = '';
        }

        if  (comp.scoring() === Competition.Type.STABLEFORD) {
            const pointsOut = points.slice(0, 9).reduce((a, b) => a + b, 0);
            const pointsBack = points.slice(9).reduce((a, b) => a + b, 0);
            const pointsTotal = pointsOut + pointsBack;

            const pointsRow = [scorecard.id, name, ph, ...points.slice(0, 9), pointsOut, ...points.slice(9), pointsBack, pointsTotal, ''].join(',') + '\n';
            csvContent += pointsRow;
        }
        if (comp.type === Competition.Type.SCRAMBLE) {
            const teeShot = scorecard.teeShot;
            const a = teeShot.filter(t => t === 'A').length;
            const b = teeShot.filter(t => t === 'B').length;
            const c = teeShot.filter(t => t === 'C').length;

            let note = '';
            if (a < 5 || b < 5 || c < 5) {
                note = `"Missing tee shots: A had ${a}, B had ${b}, C had ${c}"`;
            }

            const teeShotRow = [scorecard.id, name, ph, ...teeShot.slice(0, 9), '', ...teeShot.slice(9), '', '', note].join(',') + '\n';
            csvContent += teeShotRow;
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
