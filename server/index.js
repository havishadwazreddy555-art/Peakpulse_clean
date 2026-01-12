const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const { initDb } = require('./db');
const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activities');
const adminRoutes = require('./routes/admin');

const path = require('path');

// Serve static files from the React client
app.use(express.static(path.join(__dirname, '../client/dist')));

app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/admin', adminRoutes);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});


app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    // Initialize DB connection and schema
    await initDb();
});
