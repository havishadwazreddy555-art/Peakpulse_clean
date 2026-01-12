const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// Connection string is required for PG
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("FATAL: DATABASE_URL is missing.");
  console.error("Please create a .env file in the server folder with DATABASE_URL=your_postgres_url");
  // We don't exit here to allow the server to start and show this error in logs, 
  // but operations will fail.
}

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false // standard for cloud dbs like Neon
});

const query = (text, params) => pool.query(text, params);

const initDb = async () => {
  try {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255),
        name VARCHAR(255),
        phone_number VARCHAR(50) UNIQUE,
        password VARCHAR(255) NOT NULL,
        language VARCHAR(10) DEFAULT 'en',
        role VARCHAR(20) DEFAULT 'user',
        otp VARCHAR(10),
        otp_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createActivitiesTable = `
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        date VARCHAR(50) NOT NULL,
        time VARCHAR(50) NOT NULL,
        location TEXT,
        latitude REAL,
        longitude REAL,
        height REAL,
        depth REAL,
        distance REAL,
        sport_type VARCHAR(50) NOT NULL,
        notes TEXT,
        jump_number INTEGER,
        total_jumps INTEGER,
        freefall_time INTEGER,
        total_freefall_time INTEGER,
        tunnel_time INTEGER,
        skill_level VARCHAR(50),
        dive_number INTEGER,
        visibility VARCHAR(50),
        bottom_time INTEGER,
        signature TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createUsersTable);
    console.log('Verified Users table.');
    await pool.query(createActivitiesTable);
    console.log('Verified Activities table.');
    console.log('Database initialized successfully (PostgreSQL).');
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
};

module.exports = { query, initDb, pool };
