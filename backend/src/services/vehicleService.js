const pool = require('../config/database');

const getAllVehicles = async () => {
    const [rows] = await pool.query(`
        SELECT
            v.id,
            v.category_id,
            c.name AS category_name,
            v.name,
            v.brand,
            v.model,
            v.year,
            v.license_plate,
            v.price_per_day,
            v.description,
            v.image,
            v.status,
            v.created_at,
            v.updated_at
        FROM vehicles v
        JOIN categories c ON v.category_id = c.id
        ORDER BY v.id DESC
    `);

    return rows;
};

const getVehicleById = async (id) => {
    const [rows] = await pool.query(`
        SELECT
            v.id,
            v.category_id,
            c.name AS category_name,
            v.name,
            v.brand,
            v.model,
            v.year,
            v.license_plate,
            v.price_per_day,
            v.description,
            v.image,
            v.status,
            v.created_at,
            v.updated_at
        FROM vehicles v
        JOIN categories c ON v.category_id = c.id
        WHERE v.id = ?
    `, [id]);

    return rows[0];
};

const createVehicle = async (vehicleData) => {
    const {
        category_id,
        name,
        brand,
        model,
        year,
        license_plate,
        price_per_day,
        description,
        image,
        status
    } = vehicleData;

    const [result] = await pool.query(`
        INSERT INTO vehicles (
            category_id,
            name,
            brand,
            model,
            year,
            license_plate,
            price_per_day,
            description,
            image,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        category_id,
        name,
        brand,
        model || null,
        year || null,
        license_plate,
        price_per_day,
        description || null,
        image || null,
        status || 'available'
    ]);

    return getVehicleById(result.insertId);
};

const updateVehicle = async (id, vehicleData) => {
    const {
        category_id,
        name,
        brand,
        model,
        year,
        license_plate,
        price_per_day,
        description,
        image,
        status
    } = vehicleData;

    const [result] = await pool.query(`
        UPDATE vehicles
        SET
            category_id = ?,
            name = ?,
            brand = ?,
            model = ?,
            year = ?,
            license_plate = ?,
            price_per_day = ?,
            description = ?,
            image = ?,
            status = ?
        WHERE id = ?
    `, [
        category_id,
        name,
        brand,
        model || null,
        year || null,
        license_plate,
        price_per_day,
        description || null,
        image || null,
        status,
        id
    ]);

    if (result.affectedRows === 0) {
        return null;
    }

    return getVehicleById(id);
};

const deleteVehicle = async (id) => {
    const [result] = await pool.query(
        'DELETE FROM vehicles WHERE id = ?',
        [id]
    );

    return result.affectedRows > 0;
};

const getAvailableVehicles = async () => {
    const [rows] = await pool.query(`
        SELECT
            v.id,
            v.category_id,
            c.name AS category_name,
            v.name,
            v.brand,
            v.model,
            v.year,
            v.license_plate,
            v.price_per_day,
            v.description,
            v.image,
            v.status
        FROM vehicles v
        JOIN categories c ON v.category_id = c.id
        WHERE v.status = 'available'
        ORDER BY v.id DESC
    `);

    return rows;
};

module.exports = {
    getAllVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getAvailableVehicles
};