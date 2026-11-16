
const pool = require("../config/database");

const getUserDashboard = async (userId) => {
    const [
        [user],
        [recommendedVehicles],
        [activeBookings],
        [recentBookings],
    ] = await Promise.all([

        // Sapaan pengguna
        pool.query(
            `SELECT id, name
             FROM users
             WHERE id = ?`,
            [userId]
        ),

        // Rekomendasi kendaraan
        pool.query(
            `SELECT 
                id,
                name,
                brand,
                model,
                year,
                price_per_day,
                image,
                status
             FROM vehicles
             WHERE status = 'available'
             ORDER BY id DESC
             LIMIT 6`
        ),

        // Pemesanan aktif
        pool.query(
            `SELECT
                b.id,
                b.start_date,
                b.end_date,
                b.total_days,
                b.total_price,
                b.status,
                v.name AS vehicle_name,
                v.image AS vehicle_image
             FROM bookings b
             JOIN vehicles v ON b.vehicle_id = v.id
             WHERE b.user_id = ?
             AND b.status IN ('pending', 'confirmed', 'ongoing')
             ORDER BY b.created_at DESC`,
            [userId]
        ),

        // Pemesanan terbaru
        pool.query(
            `SELECT
                b.id,
                b.start_date,
                b.end_date,
                b.total_price,
                b.status,
                b.created_at,
                v.name AS vehicle_name,
                v.image AS vehicle_image
             FROM bookings b
             JOIN vehicles v ON b.vehicle_id = v.id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC
             LIMIT 5`,
            [userId]
        ),
    ]);

    if (!user) {
        throw new Error("Pengguna tidak ditemukan");
    }

    return {
        user,
        recommendedVehicles,
        activeBookings,
        recentBookings,
    };
};

module.exports = {
    getUserDashboard,
};