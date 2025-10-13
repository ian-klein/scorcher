//utilities for netlify functions

//Revive the competitiin date in the parsed request body
export function revive(body) {
    body.competition.date = new Date(body.competition.date);
}

//Generate the folder name for a competition
export function competitionDirectoryPath(competition) {
    const date = competition.date.toISOString().slice(0, 10);
    const name = competition.name.replace(/[^a-zA-Z0-9]/g, '-');
    return `./results/${date}-${name}`;
}

//Generate the score file name for a player
export function playerFileName(player) {
    return `${player.name.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
}