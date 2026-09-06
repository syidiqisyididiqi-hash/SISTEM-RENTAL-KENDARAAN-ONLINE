const pool = require("../config/database");

const getDashboardStatistics = async () => {
    const [[users]] = await pool.query(
        "SELECT COUNT(*) AS total FROM users"
    );
    const [[vehicles]] = await pool.query(
        "SELECT COUNT(*) AS total FROM vehicles"
    );
    const [[bookings]] = await pool.query(
        "SELECT COUNT(*) AS total FROM bookings"
    );
    const [[revenue]] = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'paid'"
    );

    return {
        total_users: users.total,
        total_vehicles: vehicles.total,
        total_bookings: bookings.total,
        total_revenue: revenue.total,
    };
};

const getRecentBookings = async () => {
    const [rows] = await pool.query(`
        SELECT
            b.id,
            u.name AS user_name,
            v.name AS vehicle_name,
            b.start_date,
            b.end_date,
            b.total_price,
            b.status,
            b.created_at
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN vehicles v ON b.vehicle_id = v.id
        ORDER BY b.created_at DESC
        LIMIT 5
    `);

    return rows;
};

const getBookingSummary = async () => {
    const [rows] = await pool.query(
        "SELECT status, COUNT(*) AS total FROM bookings GROUP BY status"
    );

    const summary = {
        pending: 0,
        confirmed: 0,
        ongoing: 0,
        completed: 0,
        cancelled: 0,
        rejected: 0,
    };

    rows.forEach((row) => {
        summary[row.status] = row.total;
    });

    return summary;
};

const getAdminDashboard = async () => ({
    statistics: await getDashboardStatistics(),
    recentBookings: await getRecentBookings(),
    bookingSummary: await getBookingSummary(),
});

module.exports = {
    getDashboardStatistics,
    getRecentBookings,
    getBookingSummary,
    getAdminDashboard,
};