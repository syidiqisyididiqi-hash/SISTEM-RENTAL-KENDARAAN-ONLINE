const pool = require('../config/database');

const getAllBookings = async () => {
    const [rows] = await pool.query(`
        SELECT
            b.id,
            b.user_id,
            u.name AS user_name,
            b.vehicle_id,
            v.name AS vehicle_name,
            v.brand,
            v.model,
            b.start_date,
            b.end_date,
            b.total_days,
            b.price_per_day,
            b.total_price,
            b.status,
            b.notes,
            b.created_at,
            b.updated_at
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN vehicles v ON b.vehicle_id = v.id
        ORDER BY b.created_at DESC
    `);

    return rows;
};

const getBookingById = async (id) => {
    const [rows] = await pool.query(`
        SELECT
            b.id,
            b.user_id,
            u.name AS user_name,
            u.email AS user_email,
            b.vehicle_id,
            v.name AS vehicle_name,
            v.brand,
            v.model,
            v.license_plate,
            b.start_date,
            b.end_date,
            b.total_days,
            b.price_per_day,
            b.total_price,
            b.status,
            b.notes,
            b.created_at,
            b.updated_at
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN vehicles v ON b.vehicle_id = v.id
        WHERE b.id = ?
    `, [id]);

    return rows[0];
};

const getBookingsByUser = async (userId) => {
    const [rows] = await pool.query(`
        SELECT
            b.id,
            b.user_id,
            b.vehicle_id,
            v.name AS vehicle_name,
            v.brand,
            v.model,
            v.license_plate,
            b.start_date,
            b.end_date,
            b.total_days,
            b.price_per_day,
            b.total_price,
            b.status,
            b.notes,
            b.created_at,
            b.updated_at
        FROM bookings b
        JOIN vehicles v ON b.vehicle_id = v.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
    `, [userId]);

    return rows;
};

const createBooking = async (data) => {
    const {
        user_id,
        vehicle_id,
        start_date,
        end_date,
        notes
    } = data;

    const [vehicles] = await pool.query(
        `SELECT id, price_per_day, status
         FROM vehicles
         WHERE id = ?`,
        [vehicle_id]
    );

    if (vehicles.length === 0) {
        throw new Error('Kendaraan tidak ditemukan');
    }

    const vehicle = vehicles[0];

    if (vehicle.status !== 'available') {
        throw new Error('Kendaraan tidak tersedia');
    }

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (end < start) {
        throw new Error('Tanggal selesai tidak boleh sebelum tanggal mulai');
    }

    const total_days = Math.ceil(
        (end - start) / (1000 * 60 * 60 * 24)
    ) + 1;

    const price_per_day = vehicle.price_per_day;
    const total_price = total_days * price_per_day;

    const [result] = await pool.query(`
        INSERT INTO bookings (
            user_id,
            vehicle_id,
            start_date,
            end_date,
            total_days,
            price_per_day,
            total_price,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        user_id,
        vehicle_id,
        start_date,
        end_date,
        total_days,
        price_per_day,
        total_price,
        notes || null
    ]);

    return getBookingById(result.insertId);
};

const updateBooking = async (id, data) => {
    const {
        start_date,
        end_date,
        notes
    } = data;

    const booking = await getBookingById(id);

    if (!booking) {
        throw new Error('Booking tidak ditemukan');
    }

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (end < start) {
        throw new Error('Tanggal selesai tidak boleh sebelum tanggal mulai');
    }

    const total_days = Math.ceil(
        (end - start) / (1000 * 60 * 60 * 24)
    ) + 1;

    const total_price = total_days * booking.price_per_day;

    await pool.query(`
        UPDATE bookings
        SET
            start_date = ?,
            end_date = ?,
            total_days = ?,
            total_price = ?,
            notes = ?
        WHERE id = ?
    `, [
        start_date,
        end_date,
        total_days,
        total_price,
        notes || null,
        id
    ]);

    return getBookingById(id);
};

const updateBookingStatus = async (id, status) => {
    const booking = await getBookingById(id);

    if (!booking) {
        throw new Error('Booking tidak ditemukan');
    }

    const allowedStatus = [
        'pending',
        'confirmed',
        'ongoing',
        'completed',
        'cancelled',
        'rejected'
    ];

    if (!allowedStatus.includes(status)) {
        throw new Error('Status booking tidak valid');
    }

    await pool.query(
        `UPDATE bookings SET status = ? WHERE id = ?`,
        [status, id]
    );

    return getBookingById(id);
};

const deleteBooking = async (id) => {
    const booking = await getBookingById(id);

    if (!booking) {
        throw new Error('Booking tidak ditemukan');
    }

    await pool.query(
        `DELETE FROM bookings WHERE id = ?`,
        [id]
    );

    return true;
};

module.exports = {
    getAllBookings,
    getBookingById,
    getBookingsByUser,
    createBooking,
    updateBooking,
    updateBookingStatus,
    deleteBooking
};