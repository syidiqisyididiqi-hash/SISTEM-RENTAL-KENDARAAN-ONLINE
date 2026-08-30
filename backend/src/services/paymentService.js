const pool = require('../config/database');

const getAllPayments = async () => {
    const [rows] = await pool.query(`
        SELECT
            p.id,
            p.booking_id,
            p.payment_method,
            p.payment_proof,
            p.amount,
            p.status,
            p.verified_at,
            p.created_at,
            p.updated_at
        FROM payments p
        ORDER BY p.created_at DESC
    `);

    return rows;
};

const getPaymentById = async (id) => {
    const [rows] = await pool.query(`
        SELECT
            p.id,
            p.booking_id,
            p.payment_method,
            p.payment_proof,
            p.amount,
            p.status,
            p.verified_at,
            p.created_at,
            p.updated_at
        FROM payments p
        WHERE p.id = ?
    `, [id]);

    return rows[0];
};

const getPaymentByBookingId = async (bookingId) => {
    const [rows] = await pool.query(`
        SELECT
            p.id,
            p.booking_id,
            p.payment_method,
            p.payment_proof,
            p.amount,
            p.status,
            p.verified_at,
            p.created_at,
            p.updated_at
        FROM payments p
        WHERE p.booking_id = ?
        ORDER BY p.created_at DESC
    `, [bookingId]);

    return rows;
};

const createPayment = async (data) => {
    const {
        booking_id,
        payment_method,
        payment_proof,
        amount
    } = data;

    const [result] = await pool.query(`
        INSERT INTO payments (
            booking_id,
            payment_method,
            payment_proof,
            amount
        )
        VALUES (?, ?, ?, ?)
    `, [
        booking_id,
        payment_method,
        payment_proof || null,
        amount
    ]);

    return getPaymentById(result.insertId);
};

const updatePayment = async (id, data) => {
    const {
        payment_method,
        payment_proof,
        amount
    } = data;

    await pool.query(`
        UPDATE payments
        SET
            payment_method = ?,
            payment_proof = ?,
            amount = ?
        WHERE id = ?
    `, [
        payment_method,
        payment_proof || null,
        amount,
        id
    ]);

    return getPaymentById(id);
};

const updatePaymentStatus = async (id, status) => {
    let query;
    let params;

    if (status === 'paid') {
        query = `
            UPDATE payments
            SET
                status = ?,
                verified_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        params = [status, id];
    } else {
        query = `
            UPDATE payments
            SET
                status = ?,
                verified_at = NULL
            WHERE id = ?
        `;

        params = [status, id];
    }

    await pool.query(query, params);

    return getPaymentById(id);
};

const deletePayment = async (id) => {
    const [result] = await pool.query(`
        DELETE FROM payments
        WHERE id = ?
    `, [id]);

    return result.affectedRows > 0;
};

module.exports = {
    getAllPayments,
    getPaymentById,
    getPaymentByBookingId,
    createPayment,
    updatePayment,
    updatePaymentStatus,
    deletePayment
};