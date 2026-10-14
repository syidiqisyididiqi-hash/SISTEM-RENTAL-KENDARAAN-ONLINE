const pool = require('../config/database');


const getAllVehicles = async ({
    search = "",
    categoryId = "",
    status = "",
    sortBy = "id",
    sortOrder = "desc",
    page = 1,
    limit = 10
} = {}) => {
    const allowedSortColumns = {
        id: "v.id",
        name: "v.name",
        brand: "v.brand",
        price_per_day: "v.price_per_day",
        stock: "v.stock",
        created_at: "v.created_at"
    };

    const safeSortColumn = allowedSortColumns[sortBy] || "v.id";
    const safeSortOrder =
        String(sortOrder).toLowerCase() === "asc" ? "ASC" : "DESC";

    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const allowedLimits = [10, 25, 50];
    const requestedLimit = parseInt(limit, 10);
    const safeLimit = allowedLimits.includes(requestedLimit)
        ? requestedLimit
        : 10;

    const offset = (safePage - 1) * safeLimit;

    const conditions = [];
    const params = [];

    if (String(search).trim()) {
        const keyword = `%${String(search).trim()}%`;

        conditions.push(`(
            v.name LIKE ?
            OR v.brand LIKE ?
            OR v.model LIKE ?
            OR v.license_plate LIKE ?
        )`);

        params.push(keyword, keyword, keyword, keyword);
    }

    const normalizedCategoryId = String(categoryId ?? "").trim();

    if (normalizedCategoryId !== "") {
        const parsedCategoryId = Number(normalizedCategoryId);

        if (!Number.isSafeInteger(parsedCategoryId) || parsedCategoryId < 1) {
            throw new Error("Filter kategori tidak valid");
        }

        conditions.push("v.category_id = ?");
        params.push(parsedCategoryId);
    }

    const allowedStatuses = [
        "available",
        "rented",
        "maintenance"
    ];

    const normalizedStatus = String(status ?? "").trim();

    if (normalizedStatus !== "") {
        if (!allowedStatuses.includes(normalizedStatus)) {
            throw new Error("Filter status tidak valid");
        }

        conditions.push("v.status = ?");
        params.push(normalizedStatus);
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

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
            v.stock,
            v.description,
            v.image,
            v.status,
            v.created_at,
            v.updated_at
        FROM vehicles v
        JOIN categories c ON v.category_id = c.id
        ${whereClause}
        ORDER BY ${safeSortColumn} ${safeSortOrder}, v.id DESC
        LIMIT ? OFFSET ?
    `, [...params, safeLimit, offset]);

    const [countRows] = await pool.query(`
        SELECT COUNT(*) AS total
        FROM vehicles v
        JOIN categories c ON v.category_id = c.id
        ${whereClause}
    `, params);

    const total = Number(countRows[0].total);

    return {
        vehicles: rows,
        pagination: {
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.ceil(total / safeLimit)
        }
    };
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
            v.stock,
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
        stock,
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
            stock,
            description,
            image,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        category_id,
        name,
        brand,
        model || null,
        year || null,
        license_plate,
        price_per_day,
        stock,
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
        stock,
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
            stock = ?,
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
        stock,
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
            v.stock,
            v.description,
            v.image,
            v.status
        FROM vehicles v
        JOIN categories c ON v.category_id = c.id
        WHERE v.status = 'available'
        AND v.stock > 0
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