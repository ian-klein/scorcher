//utilities for netlify functions

const RESULTS = './results';

//Revive the competition date in the parsed request body
export function revive(body) {
    if (body.competition.date) {
        body.competition.date = new Date(body.competition.date);
    }
}

//Generate the folder name for a competition
export function directoryFor(competition) {
    const date = competition.date.toISOString().slice(0, 10);
    const name = competition.name.replace(/[^a-zA-Z0-9]/g, '-');
    return `${RESULTS}/${date}-${name}`;
}

//Generate the score file name for a player
export function fileNameFor(player) {
    return `${player.name.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
}

export function resultsFileFor(competition) {
    const root = directoryFor(competition);
    return `${root}-results.csv`;
}
