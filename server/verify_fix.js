
const http = require('http');

// Configuration
const PORT = 3001;
const API_URL = `http://localhost:${PORT}/api`;

// 1. Guest Login to get Token
function login() {
    return new Promise((resolve, reject) => {
        const req = http.request(`${API_URL}/auth/guest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.token) resolve(json.token);
                    else reject(json);
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

// 2. Save Activity with Empty Strings
function saveActivity(token) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            date: '2023-10-27',
            sport_type: 'skydiving',
            height: '', // <-- The problematic field
            notes: 'Test from script'
        });

        const req = http.request(`${API_URL}/activities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 201) {
                    console.log("✅ Verification Passed: Activity saved successfully with empty strings.");
                    resolve();
                } else {
                    console.log("❌ Verification Failed: Status " + res.statusCode);
                    console.log("Response:", data);
                    reject(data);
                }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function run() {
    try {
        console.log("Step 1: Logging in as Guest...");
        const token = await login();
        console.log("Logged in. Token acquired.");

        console.log("Step 2: Sending Activity with empty strings...");
        await saveActivity(token);

    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
}

run();
