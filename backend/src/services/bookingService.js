const pool = require('../config/database');

const allowedBookingStatuses = [
    'pending',
    'confirmed',
    'ongoing',
    'completed',
    'cancelled',
    'rejected'
];


const getAllBookings = async ({
    search = "",
    status = "",
    startDate = "",
    endDate = "",
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 10
} = {}) => {
    const conditions = [];
    const params = [];

    if (search.trim()) {
        conditions.push(`(
            u.name LIKE ?
            OR v.name LIKE ?
            OR v.brand LIKE ?
            OR v.model LIKE ?
            OR CAST(b.id AS CHAR) LIKE ?
        )`);

        const keyword = `%${search.trim()}%`;

        params.push(
            keyword,
            keyword,
            keyword,
            keyword,
            keyword
        );
    }

    if (status) {
        if (!allowedBookingStatuses.includes(status)) {
            throw new Error("Status booking tidak valid");
        }

        conditions.push("b.status = ?");
        params.push(status);
    }

    if (startDate) {
        conditions.push("b.start_date >= ?");
        params.push(startDate);
    }

    if (endDate) {
        conditions.push("b.start_date <= ?");
        params.push(endDate);
    }

    const allowedSortColumns = {
        id: "b.id",
        created_at: "b.created_at",
        start_date: "b.start_date",
        end_date: "b.end_date",
        total_price: "b.total_price",
        total_days: "b.total_days",
        user_name: "u.name",
        vehicle_name: "v.name"
    };

    const sortColumn =
        allowedSortColumns[sortBy] || "b.created_at";

    const order =
        sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(
        100,
        Math.max(1, parseInt(limit, 10) || 10)
    );

    const offset = (parsedPage - 1) * parsedLimit;

    const [countRows] = await pool.query(`
        SELECT COUNT(*) AS total
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN vehicles v ON b.vehicle_id = v.id
        ${whereClause}
    `, params);

    const total = Number(countRows[0].total);

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
        ${whereClause}
        ORDER BY ${sortColumn} ${order}, b.id DESC
        LIMIT ? OFFSET ?
    `, [...params, parsedLimit, offset]);

    return {
        data: rows,
        pagination: {
            page: parsedPage,
            limit: parsedLimit,
            total,
            totalPages: Math.ceil(total / parsedLimit)
        }
    };
};

const getBookingById = async (id, userId) => {
    const ownerFilter = userId ? 'AND b.user_id = ?' : '';
    const params = userId ? [id, userId] : [id];

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
            v.image AS vehicle_image,
            v.license_plate,
            b.start_date,
            b.end_date,
            b.total_days,
            b.price_per_day,
            b.total_price,
            b.status,
            b.notes,
            (SELECT p.status FROM payments p WHERE p.booking_id = b.id ORDER BY p.created_at DESC LIMIT 1) AS payment_status,
            (SELECT p.payment_method FROM payments p WHERE p.booking_id = b.id ORDER BY p.created_at DESC LIMIT 1) AS payment_method,
            (SELECT p.payment_proof FROM payments p WHERE p.booking_id = b.id ORDER BY p.created_at DESC LIMIT 1) AS payment_proof,
            b.created_at,
            b.updated_at
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN vehicles v ON b.vehicle_id = v.id
        WHERE b.id = ? ${ownerFilter}
    `, params);

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
            v.image AS vehicle_image,
            v.license_plate,
            b.start_date,
            b.end_date,
            b.total_days,
            b.price_per_day,
            b.total_price,
            b.status,
            b.notes,
            (SELECT p.status FROM payments p WHERE p.booking_id = b.id ORDER BY p.created_at DESC LIMIT 1) AS payment_status,
            (SELECT p.payment_method FROM payments p WHERE p.booking_id = b.id ORDER BY p.created_at DESC LIMIT 1) AS payment_method,
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

        const start = new Date(`${start_date}T00:00:00`);
const end = new Date(`${end_date}T00:00:00`);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Tanggal booking tidak valid');
        }

        if (end < start) {
            throw new Error(
                'Tanggal selesai tidak boleh sebelum tanggal mulai'
            );
        }

        const total_days = Math.floor(
            (Date.UTC(
                end.getFullYear(),
                end.getMonth(),
                end.getDate()
            ) - Date.UTC(
                start.getFullYear(),
                start.getMonth(),
                start.getDate()
            )) / (1000 * 60 * 60 * 24)
        ) + 1;

        const price_per_day = Number(vehicle.price_per_day);
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
            'qris',
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
            ['pending', 'confirmed', 'ongoing'].includes(previousStatus) &&
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

const cancelUserBooking = async (id, userId) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [bookingRows] = await connection.query(
            `SELECT id, vehicle_id, status
             FROM bookings
             WHERE id = ? AND user_id = ?
             FOR UPDATE`,
            [id, userId]
        );

        if (bookingRows.length === 0) {
            const error = new Error('Booking tidak ditemukan');
            error.statusCode = 404;
            throw error;
        }

        const booking = bookingRows[0];

        if (!['pending', 'confirmed'].includes(booking.status)) {
            const error = new Error(
                'Booking ini tidak dapat dibatalkan'
            );
            error.statusCode = 409;
            throw error;
        }

        const [paymentRows] = await connection.query(
            `SELECT id, status, verified_at, payment_proof
            FROM payments
            WHERE booking_id = ?
            ORDER BY created_at DESC
            LIMIT 1
            FOR UPDATE`,
            [id]
        );

        const payment = paymentRows[0];

        if (booking.status === 'confirmed') {
            if (!payment || payment.status !== 'paid' || !payment.verified_at) {
                const error = new Error(
                    'Status pembayaran tidak valid untuk pembatalan'
                );
                error.statusCode = 409;
                throw error;
            }

            const [timeRows] = await connection.query(
                `SELECT TIMESTAMPDIFF(
                    SECOND, verified_at, CURRENT_TIMESTAMP
                ) AS elapsed_seconds
                 FROM payments
                 WHERE id = ?`,
                [payment.id]
            );

            if (
                timeRows[0].elapsed_seconds < 0 ||
                timeRows[0].elapsed_seconds > 4 * 60 * 60
            ) {
                const error = new Error(
                    'Batas pembatalan 4 jam sejak pembayaran dikonfirmasi telah berakhir'
                );
                error.statusCode = 409;
                throw error;
            }
        }

        await connection.query(
            `UPDATE bookings
             SET status = 'cancelled'
             WHERE id = ?`,
            [id]
        );

        if (payment) {
            const nextPaymentStatus =
                payment.status === 'paid'
                    ? 'refund_pending'
                    : payment.status === 'pending'
                        ? 'cancelled'
                        : payment.status;

            await connection.query(
                `UPDATE payments
                 SET status = ?
                 WHERE id = ?`,
                [nextPaymentStatus, payment.id]
            );
        }

        await connection.query(
            `UPDATE vehicles
             SET stock = stock + 1
             WHERE id = ?`,
            [booking.vehicle_id]
        );

        await connection.commit();

        return getBookingById(id, userId);
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
    cancelUserBooking,
    createBooking,
    updateBooking,
    updateBookingStatus,
    deleteBooking
};