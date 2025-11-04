//Get the email address of a tester

export default async function getTestEmail(request, context) {
    console.log('====== getTestEmail ======');

    const tester = process.env.TEST_EMAIL || '';

    const rbody = {
        email: tester
    };

    return new Response(JSON.stringify(rbody), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Content-Length": JSON.stringify(rbody).length
        }
    });
}
