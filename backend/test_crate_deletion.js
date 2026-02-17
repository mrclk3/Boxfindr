
// Verification script for Crate Deletion Logic
// Run with: node test_crate_deletion.js

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

async function createCabinet(token) {
    const number = `CAB-${Date.now()}`;
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

async function createCrate(token, cabinetId, suffix) {
    const res = await fetch(`${baseUrl}/crates`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            number: `CRATE-${Date.now()}-${suffix}`,
            qrCode: `QR-CRATE-${Date.now()}-${suffix}`,
            cabinetId: cabinetId
        })
    });
    if (!res.ok) throw new Error(`Create Crate failed: ${await res.text()}`);
    return await res.json();
}

async function createItem(token, crateId) {
    const formData = new FormData();
    formData.append('name', 'Test Item');
    formData.append('quantity', '5');
    formData.append('minQuantity', '1');
    formData.append('crateId', crateId.toString());

    // Note: Fetch in Node 18+ automatically sets Content-Type boundary for FormData
    const res = await fetch(`${baseUrl}/items`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!res.ok) throw new Error(`Create Item failed: ${await res.text()}`);
    return await res.json();
}

async function deleteCrate(token, crateId) {
    const res = await fetch(`${baseUrl}/crates/${crateId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return { status: res.status, body: await res.text() }; // Return status to check 200/400/403
}

async function run() {
    try {
        console.log('--- Starting Crate Deletion Verification ---');

        // 1. Setup - Login as Admin
        console.log('1. Logging in as Admin...');
        const adminToken = await login('admin@codelab.eu', 'admin123'); // From seed
        console.log('   Success.');

        // 2. Setup - Create Cabinet and Crates
        console.log('2. Creating Cabinet...');
        const cabinet = await createCabinet(adminToken);
        console.log(`   Cabinet created: ${cabinet.id}`);

        console.log('3. Creating Crate A (Empty)...');
        const crateA = await createCrate(adminToken, cabinet.id, 'A');
        console.log(`   Crate A created: ${crateA.id}`);

        console.log('4. Creating Crate B (With Item)...');
        const crateB = await createCrate(adminToken, cabinet.id, 'B');
        await createItem(adminToken, crateB.id);
        console.log(`   Crate B created and item added: ${crateB.id}`);

        // 3. Test - Admin Delete Non-Empty Crate B -> Expected 400
        console.log('5. Admin deleting Non-Empty Crate B (Expect 400)...');
        const res1 = await deleteCrate(adminToken, crateB.id);
        if (res1.status === 400) {
            console.log('   PASSED: Got 400 Bad Request.');
        } else {
            console.error(`   FAILED: Expected 400, got ${res1.status}. Body: ${res1.body}`);
        }

        // 4. Test - Admin Delete Empty Crate A -> Expected 200
        console.log('6. Admin deleting Empty Crate A (Expect 200)...');
        const res2 = await deleteCrate(adminToken, crateA.id);
        if (res2.status === 200 || res2.status === 204) { // Delete might return 200 or 204
            console.log(`   PASSED: Got ${res2.status}.`);
        } else {
            console.error(`   FAILED: Expected 200/204, got ${res2.status}. Body: ${res2.body}`);
        }

        // 5. Test - User Delete Crate -> Expected 403
        console.log('7. Logging in as User...');
        const userToken = await login('user@codelab.eu', 'user123'); // From seed

        console.log('8. User creating Crate C...');
        const crateC = await createCrate(adminToken, cabinet.id, 'C'); // Admin creates it so User can try to delete it
        // Or User creates it if allowed. Assuming only Admin can delete regardless of owner.

        console.log('9. User deleting Crate C (Expect 403)...');
        const res3 = await deleteCrate(userToken, crateC.id);
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
