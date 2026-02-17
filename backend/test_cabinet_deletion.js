
// Verification script for Cabinet Deletion Logic
// Run with: node test_cabinet_deletion.js

const baseUrl = 'http://localhost:3000';

async function login(email, password) {
    const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error(`Login failed for ${email}: ${await res.text()}`);
    return (await res.json()).access_token;
}

async function createCabinet(token, suffix) {
    const number = `CAB-${Date.now()}-${suffix}`;
    const res = await fetch(`${baseUrl}/cabinets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            number,
            location: 'Test Loc',
            qrCode: `QR-${number}`
        })
    });
    if (!res.ok) throw new Error(`Create Cabinet failed: ${await res.text()}`);
    return await res.json();
}

async function createCrate(token, cabinetId) {
    const res = await fetch(`${baseUrl}/crates`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            number: `CRATE-${Date.now()}`,
            qrCode: `QR-CRATE-${Date.now()}`,
            cabinetId: cabinetId
        })
    });
    if (!res.ok) throw new Error(`Create Crate failed: ${await res.text()}`);
    return await res.json();
}

async function deleteCabinet(token, cabinetId) {
    const res = await fetch(`${baseUrl}/cabinets/${cabinetId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return { status: res.status, body: await res.text() };
}

async function run() {
    try {
        console.log('--- Starting Cabinet Deletion Verification ---');

        // 1. Setup - Login as Admin
        console.log('1. Logging in as Admin...');
        const adminToken = await login('admin@codelab.eu', 'admin123');
        console.log('   Success.');

        // 2. Setup - Create Cabinets
        console.log('2. Creating Empty Cabinet A...');
        const cabinetA = await createCabinet(adminToken, 'A');
        console.log(`   Cabinet A created: ${cabinetA.id}`);

        console.log('3. Creating Cabinet B (With Crate)...');
        const cabinetB = await createCabinet(adminToken, 'B');
        await createCrate(adminToken, cabinetB.id);
        console.log(`   Cabinet B created and crate added: ${cabinetB.id}`);

        // 3. Test - Admin Delete Non-Empty Cabinet B -> Expected 400
        console.log('4. Admin deleting Non-Empty Cabinet B (Expect 400)...');
        const res1 = await deleteCabinet(adminToken, cabinetB.id);
        if (res1.status === 400) {
            console.log('   PASSED: Got 400 Bad Request.');
        } else {
            console.error(`   FAILED: Expected 400, got ${res1.status}. Body: ${res1.body}`);
        }

        // 4. Test - Admin Delete Empty Cabinet A -> Expected 200
        console.log('5. Admin deleting Empty Cabinet A (Expect 200)...');
        const res2 = await deleteCabinet(adminToken, cabinetA.id);
        if (res2.status === 200 || res2.status === 204) {
            console.log(`   PASSED: Got ${res2.status}.`);
        } else {
            console.error(`   FAILED: Expected 200/204, got ${res2.status}. Body: ${res2.body}`);
        }

        // 5. Test - User Delete Cabinet -> Expected 403
        console.log('6. Logging in as User...');
        const userToken = await login('user@codelab.eu', 'user123');

        console.log('7. User creating Cabinet C...');
        const cabinetC = await createCabinet(adminToken, 'C'); // Admin creates it

        console.log('8. User deleting Cabinet C (Expect 403)...');
        const res3 = await deleteCabinet(userToken, cabinetC.id);
        if (res3.status === 403) {
            console.log('   PASSED: Got 403 Forbidden.');
        } else {
            console.error(`   FAILED: Expected 403, got ${res3.status}. Body: ${res3.body}`);
        }

        console.log('--- Verification Complete ---');

    } catch (err) {
        console.error('ERROR:', err);
    }
}

run();
