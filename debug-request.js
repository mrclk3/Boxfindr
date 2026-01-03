const http = require('http');

function request(options, postData) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, res => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ statusCode: res.statusCode, body }));
        });
        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
}

async function run() {
    // 1. Login as Guest
    console.log("Logging in as Guest...");
    const loginRes = await request({
        hostname: 'localhost',
        port: 3000,
        path: '/auth/guest',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': 0
        }
    });

    if (loginRes.statusCode !== 200 && loginRes.statusCode !== 201) {
        console.error("Guest login failed:", loginRes.statusCode, loginRes.body);
        return;
    }

    const body = JSON.parse(loginRes.body);
    const token = body.access_token;
    console.log("Got Guest token:", token ? "YES" : "NO");

    // 2. Patch Quantity
    const patchData = JSON.stringify({ change: 1 });
    const patchRes = await request({
        hostname: 'localhost',
        port: 3000,
        path: '/items/6/quantity', // Using known item 6
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': patchData.length,
            'Authorization': `Bearer ${token}`
        }
    }, patchData);

    console.log(`PATCH /items/6/quantity Status: ${patchRes.statusCode}`);
    console.log(`Body: ${patchRes.body}`);
}

run();
