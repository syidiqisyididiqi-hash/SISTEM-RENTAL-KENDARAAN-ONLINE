require('dotenv').config();

const app = require('./app');
const pool = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test koneksi database
        const connection = await pool.getConnection();

        console.log('Database MySQL berhasil terhubung');

        connection.release();

        // Jalankan server
        app.listen(PORT, () => {
            console.log(`Server berjalan di http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Gagal terhubung ke database:', error.message);
        process.exit(1);
    }
};

startServer();