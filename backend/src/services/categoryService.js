const pool = require("../config/database");

const getAllCategories = async () => {
    const [rows] = await pool.query(
        "SELECT * FROM categories ORDER BY id DESC"
    );

    return rows;
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