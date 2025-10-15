//utilities for netlify functions

//Revive the competition date in the parsed request body
export function revive(body) {
    if (body.competition.date) {
        body.competition.date = new Date(body.competition.date);
    }
}

//Generate the store name for a competition
export function storeFor(competition) {
    const date = competition.date.toISOString().slice(0, 10);
    return `results-${date}`;
}

//Generate the key for a player
export function keyFor(player) {
    return player.name.replace(/[^a-zA-Z0-9]/g, '-');
}
