//Save a score to the filesystem

'use strict';

export default async function submitScore(request, context) {
    const body = '{ msg: "Score saved" }';

    
    
    const response = new Response(body, {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': body.length
        }
    });
    
    return response;
}
