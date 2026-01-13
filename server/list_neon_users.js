const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log("Connecting to Neon Cloud Database...");

        // 1. Get Users
        const res = await pool.query('SELECT id, name, phone_number, role, created_at FROM users ORDER BY id');
        console.log('\n--- 📋 REGISTERED USERS ON NEON ---');
        if (res.rows.length === 0) {
            console.log("No users found.");
        } else {
            res.rows.forEach(r => {
                console.log(`[${r.id}] Name: ${r.name || 'N/A'} | Phone: ${r.phone_number} | Role: ${r.role}`);
            });
        }

        // 2. Get Activity Count
        const acts = await pool.query('SELECT COUNT(*) FROM activities');
        console.log(`\n--- 📊 DATA STATISTICS ---`);
        console.log(`Total Activities Stored: ${acts.rows[0].count}`);

        // 3. Get Storage Size
        const sizeRes = await pool.query("SELECT pg_size_pretty(pg_database_size(current_database())) as size, pg_database_size(current_database()) as bytes");
        const bytes = parseInt(sizeRes.rows[0].bytes);
        const mb = (bytes / 1024 / 1024).toFixed(2);
        const limit = 500; // 500 MB free tier
        const percent = ((mb / limit) * 100).toFixed(2);

        console.log(`\n--- 💾 STORAGE USAGE ---`);
        console.log(`Used: ${sizeRes.rows[0].size} (${mb} MB)`);
        console.log(`Free Tier Limit: ${limit} MB`);
        console.log(`Status: ${percent}% Used`);
        console.log(`Remaining: ${(limit - mb).toFixed(2)} MB`);

    } catch (e) {
        console.error("Connection Error:", e.message);
    } finally {
        await pool.end();
    }
}
run();
