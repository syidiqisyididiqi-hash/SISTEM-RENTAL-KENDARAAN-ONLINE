const pool = require('../config/database');

const allowedBookingStatuses = [
    'pending',
    'confirmed',
    'ongoing',
    'completed',
    'cancelled',
    'rejected'
];

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
        notes,
        status = 'pending'
    } = data;

    if (!allowedBookingStatuses.includes(status)) {
        throw new Error('Status booking tidak valid');
    }

    const [users] = await pool.query(
        `SELECT id
         FROM users
         WHERE id = ? AND role = 'user'`,
        [user_id]
    );

    if (users.length === 0) {
        throw new Error('Customer tidak ditemukan');
    }

    const [vehicles] = await pool.query(
        `SELECT id, price_per_day, stock, status
        FROM vehicles
        WHERE id = ?
        FOR UPDATE`,
        [vehicle_id]
    );

    if (vehicles.length === 0) {
        throw new Error('Kendaraan tidak ditemukan');
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [vehicles] = await connection.query(
            `SELECT id, price_per_day, stock, status
            FROM vehicles
            WHERE id = ?
            FOR UPDATE`,
            [vehicle_id]
        );

        if (vehicles.length === 0) {
            throw new Error('Kendaraan tidak ditemukan');
        }

        const vehicle = vehicles[0];

        if (vehicle.status !== 'available') {
            throw new Error('Kendaraan tidak tersedia');
        }

        if (vehicle.stock < 1) {
            throw new Error('Stok kendaraan habis');
        }

        const start = new Date(start_date);
        const end = new Date(end_date);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Tanggal booking tidak valid');
        }

        if (end < start) {
            throw new Error(
                'Tanggal selesai tidak boleh sebelum tanggal mulai'
            );
        }

        const total_days = Math.ceil(
            (end - start) / (1000 * 60 * 60 * 24)
        ) + 1;

        const price_per_day = vehicle.price_per_day;
        const total_price = total_days * price_per_day;

        const [bookingResult] = await connection.query(`
            INSERT INTO bookings (
                user_id,
                vehicle_id,
                start_date,
                end_date,
                total_days,
                price_per_day,
                total_price,
                status,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            user_id,
            vehicle_id,
            start_date,
            end_date,
            total_days,
            price_per_day,
            total_price,
            status,
            notes || null
        ]);

        const bookingId = bookingResult.insertId;

        await connection.query(`
            INSERT INTO payments (
                booking_id,
                payment_method,
                payment_proof,
                amount,
                status
            )
            VALUES (?, ?, ?, ?, ?)
        `, [
            bookingId,
            'bank_transfer',
            null,
            total_price,
            'pending'
        ]);

        await connection.query(`
            UPDATE vehicles
            SET stock = stock - 1
            WHERE id = ?
            AND stock > 0
        `, [vehicle_id]);

        await connection.commit();

        return getBookingById(bookingId);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const updateBooking = async (id, data) => {
    const {
        start_date,
        end_date,
        notes,
        status
    } = data;

    const booking = await getBookingById(id);

    if (!booking) {
        throw new Error('Booking tidak ditemukan');
    }

    const nextStatus = status || booking.status;

    if (!allowedBookingStatuses.includes(nextStatus)) {
        throw new Error('Status booking tidak valid');
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
            status = ?,
            notes = ?
        WHERE id = ?
    `, [
        start_date,
        end_date,
        total_days,
        total_price,
        nextStatus,
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

    if (!allowedBookingStatuses.includes(status)) {
        throw new Error('Status booking tidak valid');
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const previousStatus = booking.status;

        await connection.query(
            `UPDATE bookings SET status = ? WHERE id = ?`,
            [status, id]
        );

        const shouldRestoreStock =
            !['cancelled', 'rejected'].includes(previousStatus) &&
            ['cancelled', 'rejected'].includes(status);

        if (shouldRestoreStock) {
            await connection.query(
                `UPDATE vehicles
                 SET stock = stock + 1
                 WHERE id = ?`,
                [booking.vehicle_id]
            );
        }

        await connection.commit();

        return getBookingById(id);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const deleteBooking = async (id) => {
    const booking = await getBookingById(id);

    if (!booking) {
        throw new Error('Booking tidak ditemukan');
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(
            `DELETE FROM bookings WHERE id = ?`,
            [id]
        );

        const shouldRestoreStock =
            !['cancelled', 'rejected'].includes(booking.status);

        if (shouldRestoreStock) {
            await connection.query(
                `UPDATE vehicles
                 SET stock = stock + 1
                 WHERE id = ?`,
                [booking.vehicle_id]
            );
        }

        await connection.commit();

        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
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