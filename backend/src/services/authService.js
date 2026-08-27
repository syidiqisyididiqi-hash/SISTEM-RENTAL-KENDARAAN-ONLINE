const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { generateToken } = require('../utils/jwt');

const register = async (name, email, password, phone) => {
    const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
    );

    if (existingUsers.length > 0) {
        throw new Error('Email sudah digunakan');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
        `INSERT INTO users 
        (name, email, password, phone, role)
        VALUES (?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, phone, 'user']
    );

    const [users] = await pool.execute(
        `SELECT id, name, email, phone, role, created_at
         FROM users
         WHERE id = ?`,
        [result.insertId]
    );

    const user = users[0];

    const token = generateToken(user);

    return {
        user,
        token
    };
};

const login = async (email, password) => {
    const [users] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );

    if (users.length === 0) {
        throw new Error('Email atau password salah');
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatch) {
        throw new Error('Email atau password salah');
    }

    delete user.password;

    const token = generateToken(user);

    return {
        user,
        token
    };
};


const registerAdmin = async (name, email, password, phone) => {
    const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
    );

    if (existingUsers.length > 0) {
        throw new Error('Email sudah digunakan');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
        `INSERT INTO users
        (name, email, password, phone, role)
        VALUES (?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, phone, 'admin']
    );

    const [users] = await pool.execute(
        `SELECT id, name, email, phone, role, created_at
         FROM users
         WHERE id = ?`,
        [result.insertId]
    );

    const user = users[0];

    const token = generateToken(user);

    return {
        user,
        token
    };
};

module.exports = {
    register,
    registerAdmin,
    login
};