const pool = require("../config/database");

const getAll = async (filters = {}) => {
    let sql = "SELECT * FROM rental_locations";
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

    const [rows] = await db.query(sql, params);
    return rows;
};

const getById = async (id) => {
    const [rows] = await db.query(
        "SELECT * FROM rental_locations WHERE id = ?",
        [id]
    );

    return rows[0] || null;
};

const create = async (data) => {
    const {
        name,
        address,
        latitude,
        longitude,
        maps_url,
        phone,
        whatsapp,
        email,
        opening_hours,
        image,
        is_active,
    } = data;

    const sql = `
        INSERT INTO rental_locations (
            name, address, latitude, longitude, maps_url,
            phone, whatsapp, email, opening_hours, image, is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        name,
        address,
        latitude ?? null,
        longitude ?? null,
        maps_url ?? null,
        phone ?? null,
        whatsapp ?? null,
        email ?? null,
        opening_hours ?? null,
        image ?? null,
        is_active === undefined ? 1 : Number(is_active),
    ];

    const [result] = await db.query(sql, params);

    return getById(result.insertId);
};

const update = async (id, data) => {
    const fields = [
        "name",
        "address",
        "latitude",
        "longitude",
        "maps_url",
        "phone",
        "whatsapp",
        "email",
        "opening_hours",
        "image",
        "is_active",
    ];

    const updates = [];
    const params = [];

    for (const field of fields) {
        if (Object.prototype.hasOwnProperty.call(data, field)) {
            updates.push(`${field} = ?`);
            params.push(
                data[field] === "" && !["name", "address"].includes(field)
                    ? null
                    : data[field]
            );
        }
    }

    if (updates.length === 0) {
        return getById(id);
    }

    params.push(id);

    await db.query(
        `UPDATE rental_locations SET ${updates.join(", ")} WHERE id = ?`,
        params
    );

    return getById(id);
};

const remove = async (id) => {
    const [result] = await db.query(
        "DELETE FROM rental_locations WHERE id = ?",
        [id]
    );

    return result.affectedRows > 0;
};

const updateStatus = async (id, is_active) => {
    const [result] = await db.query(
        "UPDATE rental_locations SET is_active = ? WHERE id = ?",
        [is_active, id]
    );

    if (result.affectedRows === 0) {
        return getById(id);
    }

    return getById(id);
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    updateStatus,
};
