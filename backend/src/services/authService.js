const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { generateToken } = require('../utils/jwt');

const register = async (name, email, password, phone) => {
    // Cek apakah email sudah digunakan
    const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
    );

    if (existingUsers.length > 0) {
        throw new Error('Email sudah digunakan');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user
    const [result] = await pool.execute(
        `INSERT INTO users 
        (name, email, password, phone, role)
        VALUES (?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, phone, 'customer']
    );

    // Ambil user yang baru dibuat
    const [users] = await pool.execute(
        `SELECT id, name, email, phone, role, created_at
         FROM users
         WHERE id = ?`,
        [result.insertId]
    );

    const user = users[0];

    // Buat JWT
    const token = generateToken(user);

    return {
        user,
        token
    };
};

const login = async (email, password) => {
    // Cari user berdasarkan email
    const [users] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );

    if (users.length === 0) {
        throw new Error('Email atau password salah');
    }

    const user = users[0];

    // Bandingkan password
    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatch) {
        throw new Error('Email atau password salah');
    }

    // Jangan kirim password ke frontend
    delete user.password;

    // Buat JWT
    const token = generateToken(user);

    return {
        user,
        token
    };
};

module.exports = {
    register,
    login
};