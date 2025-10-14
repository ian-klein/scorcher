'use strict';

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { directoryFor, resultsFileFor, revive } from '../functionsUtil.mjs';

export default async function getScores(request, context) {
    const body = await request.json();
    revive(body);

    const directoryPath = directoryFor(body.competition);

    //Read the files in the results directory
    const files = await readdir(directoryPath);

    const results = await Promise.all(files.map(async file => {
        const filePath = `${directoryPath}/${file}`;
        const fileContents = await readFile(filePath, 'utf8');
        const scores = JSON.parse(fileContents);
        return scores;
    }));

    //Create the results file .CSV Each player gets two lines in the CSV: gross scores and points
    const resultsFile = resultsFileFor(body.competition);

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
    
    // Write the CSV file
    await writeFile(resultsFile, csvContent, 'utf8');

    //Send the response
    const rbody = {
        status: 'OK',
        resultsFile: resultsFile
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
