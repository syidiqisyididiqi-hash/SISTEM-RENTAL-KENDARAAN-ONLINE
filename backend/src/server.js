
require('dotenv').config();

console.log(
    'GEMINI_API_KEY tersedia:',
    Boolean(process.env.GEMINI_API_KEY)
);

const app = require('./app');
const pool = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        const connection = await pool.getConnection();

        console.log('Database MySQL berhasil terhubung');

        connection.release();

        app.listen(PORT, () => {
            console.log(`Server berjalan di http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Gagal terhubung ke database:', error.message);
        process.exit(1);
    }
};

startServer();
