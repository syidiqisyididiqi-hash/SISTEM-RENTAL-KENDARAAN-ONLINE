const pool = require("../config/database");

const getMonthlyReport = async (month, year) => {
    const monthValue = Number(month);
    const yearValue = Number(year);

    const [[bookingStatistics]] = await pool.query(
        `
        SELECT
            COUNT(*) AS total_bookings,
            COALESCE(SUM(total_price), 0) AS total_booking_value
        FROM bookings
        WHERE MONTH(created_at) = ?
        AND YEAR(created_at) = ?
        `,
        [monthValue, yearValue]
    );

    const [[paymentStatistics]] = await pool.query(
        `
        SELECT
            COUNT(*) AS total_payments,
            COALESCE(
                SUM(
                    CASE
                        WHEN status = 'paid' THEN amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_revenue
        FROM payments
        WHERE MONTH(created_at) = ?
        AND YEAR(created_at) = ?
        `,
        [monthValue, yearValue]
    );

    const [bookingStatus] = await pool.query(
        `
        SELECT
            status,
            COUNT(*) AS total
        FROM bookings
        WHERE MONTH(created_at) = ?
        AND YEAR(created_at) = ?
        GROUP BY status
        `,
        [monthValue, yearValue]
    );

    const bookingSummary = {
        pending: 0,
        confirmed: 0,
        ongoing: 0,
        completed: 0,
        cancelled: 0,
        rejected: 0,
    };

    bookingStatus.forEach((row) => {
        bookingSummary[row.status] = Number(row.total);
    });

    const [paymentStatus] = await pool.query(
        `
        SELECT
            status,
            COUNT(*) AS total
        FROM payments
        WHERE MONTH(created_at) = ?
        AND YEAR(created_at) = ?
        GROUP BY status
        `,
        [monthValue, yearValue]
    );

    const paymentSummary = {
        pending: 0,
        paid: 0,
        rejected: 0,
    };

    paymentStatus.forEach((row) => {
        paymentSummary[row.status] = Number(row.total);
    });

    const [vehicleRevenue] = await pool.query(
        `
        SELECT
            v.id,
            v.name AS vehicle_name,
            v.brand,
            v.model,
            COUNT(b.id) AS total_bookings,
            COALESCE(
                SUM(
                    CASE
                        WHEN p.status = 'paid' THEN p.amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_revenue
        FROM vehicles v
        LEFT JOIN bookings b
            ON v.id = b.vehicle_id
            AND MONTH(b.created_at) = ?
            AND YEAR(b.created_at) = ?
        LEFT JOIN payments p
            ON b.id = p.booking_id
        GROUP BY
            v.id,
            v.name,
            v.brand,
            v.model
        HAVING total_bookings > 0
        ORDER BY total_revenue DESC
        `,
        [monthValue, yearValue]
    );

    const [bookings] = await pool.query(
        `
        SELECT
            b.id,
            u.name AS user_name,
            v.name AS vehicle_name,
            b.start_date,
            b.end_date,
            b.total_days,
            b.total_price,
            b.status,
            b.created_at
        FROM bookings b
        JOIN users u
            ON b.user_id = u.id
        JOIN vehicles v
            ON b.vehicle_id = v.id
        WHERE MONTH(b.created_at) = ?
        AND YEAR(b.created_at) = ?
        ORDER BY b.created_at DESC
        `,
        [monthValue, yearValue]
    );

    return {
        period: {
            month: monthValue,
            year: yearValue,
        },

        statistics: {
            total_bookings: Number(bookingStatistics.total_bookings),
            total_booking_value: Number(
                bookingStatistics.total_booking_value
            ),
            total_payments: Number(paymentStatistics.total_payments),
            total_revenue: Number(paymentStatistics.total_revenue),
        },

        bookingSummary,

        paymentSummary,

        vehicleRevenue: vehicleRevenue.map((vehicle) => ({
            ...vehicle,
            total_bookings: Number(vehicle.total_bookings),
            total_revenue: Number(vehicle.total_revenue),
        })),

        bookings: bookings.map((booking) => ({
            ...booking,
            total_days: Number(booking.total_days),
            total_price: Number(booking.total_price),
        })),
    };
};

module.exports = {
    getMonthlyReport,
};