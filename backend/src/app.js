const express = require('express');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Rental Kendaraan berjalan'
    });
});


app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);

app.use('/api/categories', categoryRoutes);

app.use('/api/vehicles', vehicleRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan'
    });
});

app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server'
    });
});

module.exports = app;