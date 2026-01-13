const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'local_dev.sqlite');
console.log(`Checking database at: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening DB:', err.message);
        return;
    }
});

db.serialize(() => {
    db.all("SELECT * FROM activities", (err, rows) => {
        if (err) {
            console.error('Query Error:', err);
            return;
        }
        console.log('\n--- 📂 LOCAL ACTIVITIES (SQLite) ---');
        console.log(`Total Count: ${rows.length}`);
        if (rows.length > 0) {
            rows.forEach(r => console.log(`[ID ${r.id}] ${r.sport_type} at ${r.location} (User: ${r.user_id})`));
        }
    });

    db.all("SELECT * FROM users", (err, rows) => {
        if (err) console.error(err);
        console.log('\n--- 👤 LOCAL USERS (SQLite) ---');
        console.log(`Total Count: ${rows.length}`);
        if (rows.length > 0) {
            rows.forEach(r => console.log(`[ID ${r.id}] ${r.username} (${r.phone_number})`));
        }
    });
});

db.close();
