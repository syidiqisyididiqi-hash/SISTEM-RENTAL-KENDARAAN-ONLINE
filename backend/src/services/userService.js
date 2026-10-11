const pool = require('../config/database');
const bcrypt = require('bcryptjs');


const getAllUsers = async ({
    search = '',
    role = '',
    sortBy = 'id',
    sortOrder = 'desc',
    page = 1,
    limit = 10
} = {}) => {
    const allowedSortColumns = {
        id: 'id',
        name: 'name',
        email: 'email',
        role: 'role',
        created_at: 'created_at'
    };

    const safeSortBy = allowedSortColumns[sortBy]
        ? sortBy
        : 'id';

    const safeSortOrder =
        String(sortOrder).toLowerCase() === 'asc'
            ? 'ASC'
            : 'DESC';

    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(
        100,
        Math.max(1, parseInt(limit, 10) || 10)
    );

    const offset = (safePage - 1) * safeLimit;

    const conditions = [];
    const params = [];

    if (search.trim()) {
        conditions.push(
            '(name LIKE ? OR email LIKE ? OR phone LIKE ?)'
        );

        const keyword = `%${search.trim()}%`;

        params.push(keyword, keyword, keyword);
    }

    if (role && ['user', 'admin'].includes(role)) {
        conditions.push('role = ?');
        params.push(role);
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    const [countRows] = await pool.query(
        `SELECT COUNT(*) AS total
         FROM users
         ${whereClause}`,
        params
    );

    const [rows] = await pool.query(
        `SELECT id, name, email, phone, address, role,
                created_at, updated_at
         FROM users
         ${whereClause}
         ORDER BY ${safeSortBy} ${safeSortOrder}
         LIMIT ? OFFSET ?`,
        [...params, safeLimit, offset]
    );

    return {
        users: rows,
        pagination: {
            total: Number(countRows[0].total),
            page: safePage,
            limit: safeLimit,
            totalPages: Math.ceil(
                Number(countRows[0].total) / safeLimit
            )
        }
    };
};

const getCustomers = async () => {
    const [rows] = await pool.query(
        `SELECT id, name, email, phone, address, role, created_at, updated_at
         FROM users
         WHERE role = 'user'
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
    const [result] = await pool.query(
        `DELETE FROM users
         WHERE id = ?`,
        [id]
    );

    return result.affectedRows > 0;
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
    getCustomers,
    getUserById,
    createUser,
    updateUser,
    updateProfile,
    deleteUser
};