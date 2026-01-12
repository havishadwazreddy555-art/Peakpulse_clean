const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'sports_tracker.db'), { verbose: console.log });

const columns = [
    { name: 'tunnel_time', type: 'INTEGER' },
    { name: 'skill_level', type: 'TEXT' },
    { name: 'dive_number', type: 'INTEGER' },
    { name: 'visibility', type: 'TEXT' },
    { name: 'bottom_time', type: 'INTEGER' },
    { name: 'signature', type: 'TEXT' }
];

console.log('Migrating database...');

columns.forEach(col => {
    try {
        db.exec(`ALTER TABLE activities ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Added column ${col.name}`);
    } catch (err) {
        if (err.message.includes('duplicate column name')) {
            console.log(`Column ${col.name} already exists.`);
        } else {
            console.error(`Failed to add column ${col.name}:`, err.message);
        }
    }
});

console.log('Migration complete.');
