const pool = require("../config/database");

const TABLE = "rental_locations";

const REQUIRED_FIELDS = ["name", "address"];

const OPTIONAL_FIELDS = [
    "latitude",
    "longitude",
    "maps_url",
    "phone",
    "whatsapp",
    "email",
    "opening_hours",
    "image",
];

const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS, "is_active"];

const emptyToNull = (value) =>
    value === undefined || value === "" ? null : value;

const getAllRentalLocations = async (filters = {}) => {
    let sql = `SELECT * FROM ${TABLE}`;
    const conditions = [];
    const params = [];

    if (filters.is_active !== undefined) {
        conditions.push("is_active = ?");
        params.push(Number(filters.is_active));
    }

    if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += " ORDER BY created_at DESC";

    const [rows] = await pool.query(sql, params);

    return rows;
};

const getRentalLocationById = async (id) => {
    const [rows] = await pool.query(
        `SELECT * FROM ${TABLE} WHERE id = ?`,
        [id]
    );

    return rows[0] || null;
};

const createRentalLocation = async (data) => {
    const values = ALL_FIELDS.map((field) => {
        if (REQUIRED_FIELDS.includes(field)) return data[field];

        if (field === "is_active") {
            return data.is_active === undefined ? 1 : Number(data.is_active);
        }

        return emptyToNull(data[field]);
    });

    const placeholders = ALL_FIELDS.map(() => "?").join(", ");

    const [result] = await pool.query(
        `INSERT INTO ${TABLE} (${ALL_FIELDS.join(", ")}) VALUES (${placeholders})`,
        values
    );

    return getRentalLocationById(result.insertId);
};

const updateRentalLocation = async (id, data) => {
    const updates = [];
    const params = [];

    for (const field of ALL_FIELDS) {
        if (!Object.prototype.hasOwnProperty.call(data, field)) continue;

        const isRequiredOrStatus =
            REQUIRED_FIELDS.includes(field) || field === "is_active";

        updates.push(`${field} = ?`);
        params.push(isRequiredOrStatus ? data[field] : emptyToNull(data[field]));
    }

    if (updates.length === 0) {
        return getRentalLocationById(id);
    }

    params.push(id);

    await pool.query(
        `UPDATE ${TABLE} SET ${updates.join(", ")} WHERE id = ?`,
        params
    );

    return getRentalLocationById(id);
};

const updateRentalLocationStatus = async (id, is_active) => {
    await pool.query(
        `UPDATE ${TABLE} SET is_active = ? WHERE id = ?`,
        [is_active, id]
    );

    return getRentalLocationById(id);
};

const deleteRentalLocation = async (id) => {
    try {
        const [result] = await pool.query(
            `DELETE FROM ${TABLE} WHERE id = ?`,
            [id]
        );

        return result.affectedRows > 0;
    } catch (error) {
        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            const referencedError = new Error(
                "Lokasi rental tidak dapat dihapus karena masih digunakan oleh data lain. Nonaktifkan lokasi sebagai gantinya."
            );
            referencedError.statusCode = 409;
            throw referencedError;
        }

        throw error;
    }
};

module.exports = {
    getAllRentalLocations,
    getRentalLocationById,
    createRentalLocation,
    updateRentalLocation,
    updateRentalLocationStatus,
    deleteRentalLocation,
};