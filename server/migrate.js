const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'sports_tracker.db'), { verbose: console.log });

try {
    console.log('Migrating database...');
    db.exec('ALTER TABLE activities ADD COLUMN freefall_time INTEGER');
    db.exec('ALTER TABLE activities ADD COLUMN total_freefall_time INTEGER');
    console.log('Migration successful');
} catch (err) {
    if (err.message.includes('duplicate column name')) {
        console.log('Columns already exist, skipping migration.');
    } else {
        console.error('Migration failed:', err.message);
    }
}
