const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

let pool;
let dbType = 'postgres';

// Decision Logic: Use SQLite if NOT in production, otherwise use Postgres
if (!isProduction) {
  dbType = 'sqlite';
  console.log("🛠️  Running in LOCAL mode. Using SQLite database.");
} else {
  console.log("🚀 Running in PRODUCTION mode. Using PostgreSQL (Neon).");
  if (!process.env.DATABASE_URL) {
    console.error("FATAL: DATABASE_URL is missing in production!");
  }
}

// SQLite Connection Holder
let sqliteDb;

if (dbType === 'sqlite') {
  const dbPath = path.resolve(__dirname, 'local_dev.sqlite');
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Could not connect to SQLite:', err);
    else console.log(`Connected to SQLite database at: ${dbPath}`);
  });
} else {
  // Postgres Connection
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

// Wrapper to standardise queries between PG and SQLite
const query = (text, params = []) => {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      // Convert Postgres $1, $2 syntax to SQLite ?, ? syntax
      let sqliteText = text;
      let paramIndex = 1;
      while (sqliteText.includes('$' + paramIndex)) {
        sqliteText = sqliteText.replace('$' + paramIndex, '?');
        paramIndex++;
      }

      // Determine query type
      const trimmed = sqliteText.trim();
      const command = trimmed.split(/\s+/)[0].toUpperCase();

      if (command === 'SELECT') {
        sqliteDb.all(sqliteText, params, (err, rows) => {
          if (err) return reject(err);
          resolve({ rows, rowCount: rows.length });
        });
      } else {
        // Handle INSERT, UPDATE, DELETE
        if (command === 'INSERT' && trimmed.toUpperCase().includes('RETURNING ID')) {
          sqliteText = sqliteText.replace(/RETURNING\s+id/i, '');
        }

        sqliteDb.run(sqliteText, params, function (err) {
          if (err) return reject(err);
          // Mimic Postgres result object
          const result = {
            rows: this.lastID ? [{ id: this.lastID }] : [],
            rowCount: this.changes
          };
          resolve(result);
        });
      }
    } else {
      // Postgres Query
      pool.query(text, params)
        .then(res => resolve(res))
        .catch(err => reject(err));
    }
  });
};

const initDb = async () => {
  console.log(`Initializing ${dbType === 'sqlite' ? 'SQLite' : 'PostgreSQL'} tables...`);

  // Schema adapted for both (SQLite handles types loosely, but syntax is mostly compatible)
  // Removed SERIAL (PG specific) -> INTEGER PRIMARY KEY AUTOINCREMENT (SQLite)
  // We adjust the query dynamically for the DB type

  const idType = dbType === 'sqlite' ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'SERIAL PRIMARY KEY';
  const timestampDefault = dbType === 'sqlite' ? 'DATETIME DEFAULT CURRENT_TIMESTAMP' : 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP';

  try {
    const createUsersTable = `
          CREATE TABLE IF NOT EXISTS users (
            id ${idType},
            username VARCHAR(255),
            name VARCHAR(255),
            phone_number VARCHAR(50) UNIQUE,
            password VARCHAR(255) NOT NULL,
            language VARCHAR(10) DEFAULT 'en',
            role VARCHAR(20) DEFAULT 'user',
            otp VARCHAR(10),
            otp_expiry ${timestampDefault},
            created_at ${timestampDefault}
          );
        `;

    const createActivitiesTable = `
          CREATE TABLE IF NOT EXISTS activities (
            id ${idType},
            user_id INTEGER NOT NULL REFERENCES users(id),
            date VARCHAR(50) NOT NULL,
            time VARCHAR(50) NOT NULL,
            location TEXT,
            latitude REAL,
            longitude REAL,
            height REAL,
            depth REAL,
            distance REAL,
            total_distance REAL,
            sport_type VARCHAR(50) NOT NULL,
            notes TEXT,
            jump_number INTEGER,
            total_jumps INTEGER,
            freefall_time INTEGER,
            total_freefall_time INTEGER,
            tunnel_time INTEGER,
            total_tunnel_time INTEGER,
            skill_level VARCHAR(50),
            dive_number INTEGER,
            visibility VARCHAR(50),
            bottom_time INTEGER,
            total_bottom_time INTEGER,
            signature TEXT,
            created_at ${timestampDefault}
          );
        `;

    await query(createUsersTable);
    console.log('Verified Users table.');
    await query(createActivitiesTable);
    console.log('Verified Activities table.');

    // Migrations for existing SQLite/Postgres tables
    const migrations = [
      "ALTER TABLE activities ADD COLUMN total_distance REAL",
      "ALTER TABLE activities ADD COLUMN total_tunnel_time INTEGER",
      "ALTER TABLE activities ADD COLUMN total_bottom_time INTEGER"
    ];

    for (const migration of migrations) {
      try {
        await query(migration);
        console.log(`Applied migration: ${migration}`);
      } catch (err) {
        // Ignore "duplicate column" errors
      }
    }

    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
};

module.exports = { query, initDb, pool };
