const pool = require("../config/database");

const getPaymentSettings = async () => {
    const [rows] = await pool.query(`
        SELECT
            id,
            qris_image,
            created_at,
            updated_at
        FROM payment_settings
        ORDER BY id ASC
        LIMIT 1
    `);

    return rows[0] || null;
};
const updateQrisImage = async (qrisImage) => {
    const existingSettings = await getPaymentSettings();

    if (existingSettings) {
        await pool.query(
            `
            UPDATE payment_settings
            SET qris_image = ?
            WHERE id = ?
            `,
            [
                qrisImage,
                existingSettings.id,
            ]
        );

        return getPaymentSettings();
    }

    await pool.query(
        `
        INSERT INTO payment_settings (
            qris_image
        )
        VALUES (?)
        `,
        [qrisImage]
    );

    return getPaymentSettings();
};

const deleteQrisImage = async () => {
    const existingSettings = await getPaymentSettings();

    if (!existingSettings) {
        return null;
    }

    await pool.query(
        `
        UPDATE payment_settings
        SET qris_image = NULL
        WHERE id = ?
        `,
        [existingSettings.id]
    );

    return getPaymentSettings();
};

module.exports = {
    getPaymentSettings,
    updateQrisImage,
    deleteQrisImage,
};