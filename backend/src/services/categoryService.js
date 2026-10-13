const pool = require("../config/database");


const getAllCategories = async ({
    search = "",
    sortBy = "id",
    sortOrder = "asc",
    page = 1,
    limit = 10,
} = {}) => {
    const allowedSortBy = ["id", "name"];
    const safeSortBy = allowedSortBy.includes(sortBy)
        ? sortBy
        : "id";

    const safeSortOrder =
        String(sortOrder).toLowerCase() === "desc"
            ? "DESC"
            : "ASC";

    const safePage =
        Number.isInteger(Number(page)) && Number(page) > 0
            ? Number(page)
            : 1;

    const allowedLimits = [10, 25, 50];
    const safeLimit = allowedLimits.includes(Number(limit))
        ? Number(limit)
        : 10;

    const offset = (safePage - 1) * safeLimit;
    const searchTerm = `%${search}%`;

    const [rows] = await pool.query(
        `SELECT *
         FROM categories
         WHERE name LIKE ?
         ORDER BY ${safeSortBy} ${safeSortOrder}
         LIMIT ? OFFSET ?`,
        [searchTerm, safeLimit, offset]
    );

    const [countRows] = await pool.query(
        `SELECT COUNT(*) AS total
         FROM categories
         WHERE name LIKE ?`,
        [searchTerm]
    );

    const total = countRows[0].total;

    return {
        categories: rows,
        pagination: {
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.ceil(total / safeLimit),
        },
    };
};

const getCategoryById = async (id) => {
    const [rows] = await pool.query(
        "SELECT * FROM categories WHERE id = ?",
        [id]
    );

    return rows[0];
};

const createCategory = async (name, description) => {
    const [result] = await pool.query(
        `INSERT INTO categories (name, description)
         VALUES (?, ?)`,
        [name, description]
    );

    return getCategoryById(result.insertId);
};

const updateCategory = async (id, name, description) => {
    await pool.query(
        `UPDATE categories
         SET name = ?, description = ?
         WHERE id = ?`,
        [name, description, id]
    );

    return getCategoryById(id);
};

const deleteCategory = async (id) => {
    const [result] = await pool.query(
        "DELETE FROM categories WHERE id = ?",
        [id]
    );

    return result.affectedRows;
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};