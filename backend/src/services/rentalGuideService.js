const db = require("../config/database");

const rentalGuideService = {
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT *
            FROM rental_guide_steps
            ORDER BY step_order ASC, id ASC
        `);

        return rows;
    },

    getActive: async () => {
        const [rows] = await db.query(`
            SELECT *
            FROM rental_guide_steps
            WHERE is_active = 1
            ORDER BY step_order ASC, id ASC
        `);

        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query(
            `
                SELECT *
                FROM rental_guide_steps
                WHERE id = ?
                LIMIT 1
            `,
            [id]
        );

        return rows[0] || null;
    },

    create: async (data) => {
        const {
            title,
            description,
            image,
            step_order,
            is_active,
        } = data;

        const [result] = await db.query(
            `
                INSERT INTO rental_guide_steps
                (
                    title,
                    description,
                    image,
                    step_order,
                    is_active
                )
                VALUES (?, ?, ?, ?, ?)
            `,
            [
                title,
                description,
                image,
                step_order,
                is_active,
            ]
        );

        return rentalGuideService.getById(result.insertId);
    },

    update: async (id, data) => {
        const {
            title,
            description,
            image,
            step_order,
            is_active,
        } = data;

        await db.query(
            `
                UPDATE rental_guide_steps
                SET
                    title = ?,
                    description = ?,
                    image = ?,
                    step_order = ?,
                    is_active = ?
                WHERE id = ?
            `,
            [
                title,
                description,
                image,
                step_order,
                is_active,
                id,
            ]
        );

        return rentalGuideService.getById(id);
    },

    updateStatus: async (id, is_active) => {
        await db.query(
            `
                UPDATE rental_guide_steps
                SET is_active = ?
                WHERE id = ?
            `,
            [is_active, id]
        );

        return rentalGuideService.getById(id);
    },

    delete: async (id) => {
        const [result] = await db.query(
            `
                DELETE FROM rental_guide_steps
                WHERE id = ?
            `,
            [id]
        );

        return result.affectedRows > 0;
    },
};

module.exports = rentalGuideService;