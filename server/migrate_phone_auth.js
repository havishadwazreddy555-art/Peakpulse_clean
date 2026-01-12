const { db } = require('./db');

try {
    console.log('Migrating database for Phone Auth...');

    const columns = [
        { name: 'phone_number', type: 'TEXT' },
        { name: 'name', type: 'TEXT' },
        { name: 'otp', type: 'TEXT' },
        { name: 'otp_expiry', type: 'DATETIME' }
    ];

    columns.forEach(col => {
        try {
            db.exec(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
            console.log(`Added ${col.name} column`);
        } catch (err) {
            if (err.message.includes('duplicate column name')) {
                console.log(`Column ${col.name} already exists`);
            } else {
                console.error(`Failed to add ${col.name}:`, err.message);
            }
        }
    });

    try {
        db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number)');
        console.log('Created unique index on phone_number');
    } catch (err) {
        console.error('Failed to create index:', err.message);
    }

} catch (err) {
    console.error('Migration failed:', err.message);
}
