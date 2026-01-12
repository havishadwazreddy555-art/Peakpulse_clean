const { db } = require('./db');

try {
    console.log('Migrating database...');
    db.exec('ALTER TABLE activities ADD COLUMN freefall_time INTEGER');
    console.log('Added freefall_time column');
} catch (err) {
    if (err.message.includes('duplicate column name')) {
        console.log('Column freefall_time already exists');
    } else {
        console.error('Migration failed:', err.message);
    }
}
