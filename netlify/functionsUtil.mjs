//utilities for netlify functions

//Generate the store name for a competition
export function storeFor(competition) {
    return `resultsv2-${competition.date}`;
}

//Generate the key for a player
export function keyFor(id) {
    return id;
}

    
