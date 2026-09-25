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
    if (!['pending', 'paid', 'rejected'].includes(status)) {
        throw new Error('Status pembayaran tidak valid.');
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [paymentRows] = await connection.query(`
            SELECT
                id,
                booking_id,
                status
            FROM payments
            WHERE id = ?
            FOR UPDATE
        `, [id]);

        if (paymentRows.length === 0) {
            throw new Error('Pembayaran tidak ditemukan.');
        }

        const payment = paymentRows[0];

        if (status === 'paid') {
            await connection.query(`
                UPDATE payments
                SET
                    status = ?,
                    verified_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [status, id]);

            await connection.query(`
                UPDATE bookings
                SET status = 'confirmed'
                WHERE id = ?
            `, [payment.booking_id]);
        }

        if (status === 'rejected') {
            await connection.query(`
                UPDATE payments
                SET
                    status = ?,
                    verified_at = NULL
                WHERE id = ?
            `, [status, id]);

            await connection.query(`
                UPDATE bookings
                SET status = 'rejected'
                WHERE id = ?
            `, [payment.booking_id]);
        }

        if (status === 'pending') {
            await connection.query(`
                UPDATE payments
                SET
                    status = ?,
                    verified_at = NULL
                WHERE id = ?
            `, [status, id]);

            await connection.query(`
                UPDATE bookings
                SET status = 'pending'
                WHERE id = ?
            `, [payment.booking_id]);
        }

        await connection.commit();

        return getPaymentById(id);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
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