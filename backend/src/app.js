const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test API
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Rental Kendaraan berjalan'
    });
});

// Routes
app.use('/api/auth', authRoutes);

// Error jika endpoint tidak ditemukan
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan'
    });
});

module.exports = app;