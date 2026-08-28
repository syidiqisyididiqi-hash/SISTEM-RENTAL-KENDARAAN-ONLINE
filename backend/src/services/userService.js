const pool = require('../config/database');

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
    const [result] = await pool.query(
        `DELETE FROM users WHERE id = ?`,
        [id]
    );

    return result;
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};