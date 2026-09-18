const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const getAllUsers = async () => {
    const [rows] = await pool.query(
        `SELECT id, name, email, phone, address, role, created_at, updated_at
         FROM users
         ORDER BY id DESC`
    );

    return rows;
};

const getUserById = async (id) => {
    const [rows] = await pool.query(
        `SELECT id, name, email, phone, address, role, created_at, updated_at
         FROM users
         WHERE id = ?`,
        [id]
    );

    return rows[0];
};

const createUser = async (data) => {
    const {
        name,
        email,
        password,
        phone,
        address,
        role
    } = data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
        `INSERT INTO users
        (name, email, password, phone, address, role)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            name,
            email,
            hashedPassword,
            phone,
            address,
            role
        ]
    );

    return getUserById(result.insertId);
};

const updateUser = async (id, data) => {
    const { name, email, phone, address, role } = data;

    const [result] = await pool.query(
        `UPDATE users
         SET name = ?, email = ?, phone = ?, address = ?, role = ?
         WHERE id = ?`,
        [name, email, phone, address, role, id]
    );

    return result;
};

const deleteUser = async (id) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(
            `DELETE payments
             FROM payments
             INNER JOIN bookings ON bookings.id = payments.booking_id
             WHERE bookings.user_id = ?`,
            [id]
        );

        await connection.query(
            `DELETE FROM bookings WHERE user_id = ?`,
            [id]
        );

        const [result] = await connection.query(
            `DELETE FROM users WHERE id = ?`,
            [id]
        );

        await connection.commit();

        return result.affectedRows > 0;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const updateProfile = async (id, data) => {
    const {
        name,
        email,
        phone,
        address
    } = data;

    const [result] = await pool.query(
        `UPDATE users
         SET name = ?, email = ?, phone = ?, address = ?
         WHERE id = ?`,
        [
            name,
            email,
            phone,
            address,
            id
        ]
    );

    return result;
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    updateProfile,
    deleteUser
};