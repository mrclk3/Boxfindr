

async function run() {
    const baseUrl = 'http://localhost:3000';

    console.log('1. Logging in as guest...');
    const loginRes = await fetch(`${baseUrl}/auth/guest`, {
        method: 'POST'
    });

    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        return;
    }

    const { access_token } = await loginRes.json();
    console.log('Login successful. Token obtained.');

    const cabinetData = {
        number: 'TEST-' + Date.now(),
        location: 'Test Location',
        qrCode: 'QR-' + Date.now()
    };

    console.log('2. Creating cabinet with invalid token...', cabinetData);
    const createRes1 = await fetch(`${baseUrl}/cabinets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer INVALID_TOKEN`
        },
        body: JSON.stringify(cabinetData)
    });

    console.log('Status:', createRes1.status);
    console.log('Body:', await createRes1.text());
    
    return; // Stop here for this test
}

run().catch(console.error);
