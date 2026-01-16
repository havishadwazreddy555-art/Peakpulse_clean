
const { query } = require('./db');

async function testInsert() {
    try {
        console.log("Testing insert with empty strings in PRODUCTION mode...");

        // Simulating the query used in activities.js
        const text = `
            INSERT INTO activities (
                user_id, date, time, location, latitude, longitude, height, depth, distance, total_distance, sport_type, notes, jump_number, total_jumps, freefall_time, total_freefall_time, tunnel_time, total_tunnel_time, skill_level, dive_number, visibility, bottom_time, total_bottom_time, signature
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
            RETURNING id
        `;

        // The exact values that might come from the client: empty strings for numbers
        const values = [
            1, // user_id
            '2023-01-01', // date
            '12:00', // time
            'Test Loc', // location
            '', // latitude (REAL) <- EXPECT ERROR
            '', // longitude (REAL)
            '', // height (REAL)
            '', // depth (REAL)
            '', // distance (REAL)
            '', // total_distance (REAL)
            'skydiving', // sport_type
            'notes', // notes
            '', // jump_number (INTEGER) <- EXPECT ERROR
            '', // total_jumps
            '', // freefall_time
            '', // total_freefall_time
            '', // tunnel_time
            '', // total_tunnel_time
            '', // skill_level
            '', // dive_number
            '', // visibility
            '', // bottom_time
            '', // total_bottom_time
            ''  // signature
        ];

        await query(text, values);
        console.log("Insert SUCCESS (Hypothesis Incorrect: Postgres accepted empty strings)");
    } catch (err) {
        console.error("Insert FAILED (Hypothesis Confirmed):");
        console.error(err.message);
    }
}

testInsert();
