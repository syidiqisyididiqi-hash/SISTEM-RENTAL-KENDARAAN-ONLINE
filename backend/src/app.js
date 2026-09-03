const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();


app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

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

app.use('/api/bookings', bookingRoutes);

app.use('/api/payments', paymentRoutes);


app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan'
    });
});


app.use((err, req, res, next) => {
    console.error('ERROR:', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Terjadi kesalahan pada server'
    });
});


module.exports = app;