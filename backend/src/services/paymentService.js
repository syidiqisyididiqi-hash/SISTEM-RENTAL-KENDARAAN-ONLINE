const pool = require("../config/database");

const getAllPayments = async ({
    search = "",
    status = "",
    paymentMethod = "",
    startDate = "",
    endDate = "",
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 10,
} = {}) => {
    const conditions = [];
    const values = [];

    if (search.trim()) {
        conditions.push(`
            (
                CAST(p.id AS CHAR) LIKE ?
                OR CAST(p.booking_id AS CHAR) LIKE ?
                OR CAST(b.user_id AS CHAR) LIKE ?
                OR u.name LIKE ?
            )
        `);

        const keyword = `%${search.trim()}%`;

        values.push(
            keyword,
            keyword,
            keyword,
            keyword
        );
    }

    const allowedStatuses = [
        "pending",
        "paid",
        "rejected",
        "cancelled",
        "refund_pending",
        "refunded",
    ];

    if (allowedStatuses.includes(status)) {
        conditions.push("p.status = ?");
        values.push(status);
    }

    if (["qris", "cash"].includes(paymentMethod)) {
        conditions.push("p.payment_method = ?");
        values.push(paymentMethod);
    }

    if (startDate) {
        conditions.push("p.created_at >= ?");
        values.push(`${startDate} 00:00:00`);
    }

    if (endDate) {
        conditions.push("p.created_at < DATE_ADD(?, INTERVAL 1 DAY)");
        values.push(endDate);
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const allowedSortColumns = {
        id: "p.id",
        booking_id: "p.booking_id",
        amount: "p.amount",
        status: "p.status",
        created_at: "p.created_at",
        verified_at: "p.verified_at",
    };

    const sortColumn =
        allowedSortColumns[sortBy] || "p.created_at";

    const direction =
        sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.min(
        100,
        Math.max(1, parseInt(limit, 10) || 10)
    );
    const offset = (currentPage - 1) * perPage;

    const [countRows] = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM payments p
        JOIN bookings b ON b.id = p.booking_id
        LEFT JOIN users u ON u.id = b.user_id
        ${whereClause}
        `,
        values
    );

    const total = Number(countRows[0].total);

    const [rows] = await pool.query(
        `
        SELECT
            p.id,
            p.booking_id,
            b.user_id,
            u.name AS user_name,
            p.payment_method,
            p.amount,
            p.payment_proof,
            p.status,
            p.verified_at,
            p.created_at,
            p.updated_at
        FROM payments p
        JOIN bookings b ON b.id = p.booking_id
        LEFT JOIN users u ON u.id = b.user_id
        ${whereClause}
        ORDER BY ${sortColumn} ${direction}
        LIMIT ? OFFSET ?
        `,
        [...values, perPage, offset]
    );

    return {
        data: rows,
        pagination: {
            page: currentPage,
            limit: perPage,
            total,
            totalPages: Math.ceil(total / perPage),
        },
    };
};

const getPaymentById = async (id) => {
    const [rows] = await pool.query(
        `
        SELECT
            p.id,
            p.booking_id,
            p.payment_method,
            p.amount,
            p.payment_proof,
            p.status,
            p.verified_at,
            p.created_at,
            p.updated_at
        FROM payments p
        WHERE p.id = ?
        `,
        [id]
    );

    return rows[0];
};

const getPaymentByBookingId = async (bookingId) => {
    const [rows] = await pool.query(
        `
        SELECT
            p.id,
            p.booking_id,
            p.payment_method,
            p.amount,
            p.payment_proof,
            p.status,
            p.verified_at,
            p.created_at,
            p.updated_at
        FROM payments p
        WHERE p.booking_id = ?
        ORDER BY p.created_at DESC
        `,
        [bookingId]
    );

    return rows;
};

const createPayment = async (data) => {
    const {
        booking_id,
        payment_method,
        amount,
    } = data;

    const [result] = await pool.query(
        `
        INSERT INTO payments (
            booking_id,
            payment_method,
            amount
        )
        VALUES (?, ?, ?)
        `,
        [
            booking_id,
            payment_method,
            amount,
        ]
    );

    return getPaymentById(result.insertId);
};

const submitPaymentProof = async ({
    booking_id,
    user_id,
    payment_method,
    payment_proof,
}) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [rows] = await connection.query(
            `
            SELECT
                p.id,
                p.status AS payment_status,
                b.total_price,
                b.status AS booking_status
            FROM payments p
            JOIN bookings b ON b.id = p.booking_id
            WHERE p.booking_id = ?
                AND b.user_id = ?
            ORDER BY p.created_at DESC
            LIMIT 1
            FOR UPDATE
            `,
            [booking_id, user_id]
        );

        if (rows.length === 0) {
            const error = new Error("Booking tidak ditemukan.");
            error.statusCode = 404;
            throw error;
        }

        const payment = rows[0];

        if (
            ["cancelled", "completed", "rejected"].includes(
                payment.booking_status
            )
        ) {
            const error = new Error(
                "Booking ini tidak dapat menerima pembayaran."
            );
            error.statusCode = 409;
            throw error;
        }

        if (
            [
                "paid",
                "cancelled",
                "refund_pending",
                "refunded",
            ].includes(payment.payment_status)
        ) {
            const error = new Error(
                "Pembayaran ini tidak dapat diubah atau dikirim ulang."
            );
            error.statusCode = 409;
            throw error;
        }

        await connection.query(
            `
            UPDATE payments
            SET
                payment_method = ?,
                payment_proof = ?,
                amount = ?,
                status = 'pending',
                verified_at = NULL
            WHERE id = ?
            `,
            [
                payment_method,
                payment_proof,
                payment.total_price,
                payment.id,
            ]
        );

        await connection.commit();

        return getPaymentById(payment.id);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const updatePayment = async (id, data) => {
    const {
        payment_method,
        amount,
    } = data;

    await pool.query(
        `
        UPDATE payments
        SET
            payment_method = ?,
            amount = ?
        WHERE id = ?
        `,
        [
            payment_method,
            amount,
            id,
        ]
    );

    return getPaymentById(id);
};

const updatePaymentStatus = async (id, status) => {
    if (
        ![
            "pending",
            "paid",
            "rejected",
            "refund_pending",
            "refunded",
        ].includes(status)
    ) {
        throw new Error("Status pembayaran tidak valid.");
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [paymentRows] = await connection.query(
            `
            SELECT
                p.id,
                p.booking_id,
                p.status AS payment_status,
                p.verified_at,
                b.status AS booking_status,
                b.vehicle_id
            FROM payments p
            JOIN bookings b ON p.booking_id = b.id
            WHERE p.id = ?
            FOR UPDATE
            `,
            [id]
        );

        if (paymentRows.length === 0) {
            throw new Error(
                "Pembayaran atau booking tidak ditemukan."
            );
        }

        const payment = paymentRows[0];

        if (
            payment.payment_status === "paid" &&
            ["pending", "rejected"].includes(status)
        ) {
            throw new Error(
                "Pembayaran yang sudah dikonfirmasi tidak dapat dikembalikan ke status ini."
            );
        }

        if (status === "refunded") {
                if (
            payment.payment_status !== "refund_pending" ||
            payment.booking_status !== "cancelled"
        ) {
            throw new Error(
                "Refund hanya dapat dikonfirmasi untuk booking yang dibatalkan dan sedang menunggu pengembalian."
            );
        }

        await connection.query(
            `
            UPDATE payments
            SET status = 'refunded'
            WHERE id = ?
            `,
            [id]
        );

    } else if (
        status === "paid" &&
        payment.payment_status === "refund_pending"
    ) {
        if (payment.booking_status !== "cancelled") {
            throw new Error(
                "Booking harus dibatalkan untuk menolak refund."
            );
        }

        await connection.query(
            `
            UPDATE payments
            SET status = 'paid'
            WHERE id = ?
            `,
            [id]
        );

    } else {
        if (
            ["cancelled", "completed", "rejected"].includes(
                payment.booking_status
            )
        ) {
            throw new Error(
                "Pembayaran tidak dapat diubah karena booking sudah dibatalkan, ditolak, atau selesai."
            );
        }

            if (status === "paid") {
                await connection.query(
                    `
                    UPDATE payments
                    SET
                        status = 'paid',
                        verified_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                    `,
                    [id]
                );

                await connection.query(
                    `
                    UPDATE bookings
                    SET status = 'confirmed'
                    WHERE id = ?
                    `,
                    [payment.booking_id]
                );
            }

            if (status === "rejected") {
                await connection.query(
                    `
                    UPDATE payments
                    SET
                        status = 'rejected',
                        verified_at = NULL
                    WHERE id = ?
                    `,
                    [id]
                );

                const shouldRestoreStock = ![
                    "cancelled",
                    "rejected",
                    "completed",
                ].includes(payment.booking_status);

                if (shouldRestoreStock) {
                    await connection.query(
                        `
                        UPDATE vehicles
                        SET stock = stock + 1
                        WHERE id = ?
                        `,
                        [payment.vehicle_id]
                    );
                }

                await connection.query(
                    `
                    UPDATE bookings
                    SET status = 'rejected'
                    WHERE id = ?
                    `,
                    [payment.booking_id]
                );
            }

            if (status === "pending") {
                await connection.query(
                    `
                    UPDATE payments
                    SET
                        status = 'pending',
                        verified_at = NULL
                    WHERE id = ?
                    `,
                    [id]
                );

                await connection.query(
                    `
                    UPDATE bookings
                    SET status = 'pending'
                    WHERE id = ?
                    `,
                    [payment.booking_id]
                );
            }
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
    const [result] = await pool.query(
        `
        DELETE FROM payments
        WHERE id = ?
        `,
        [id]
    );

    return result.affectedRows > 0;
};

module.exports = {
    getAllPayments,
    getPaymentById,
    getPaymentByBookingId,
    createPayment,
    submitPaymentProof,
    updatePayment,
    updatePaymentStatus,
    deletePayment,
};