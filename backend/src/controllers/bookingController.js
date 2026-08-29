const bookingService = require('../services/bookingService');

const getAllBookings = async (req, res) => {
    try {
        const bookings = await bookingService.getAllBookings();

        res.json({
            success: true,
            message: 'Data booking berhasil diambil',
            data: bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data booking',
            error: error.message
        });
    }
};

const getBookingById = async (req, res) => {
    try {
        const booking = await bookingService.getBookingById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Data booking berhasil diambil',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data booking',
            error: error.message
        });
    }
};

const getBookingsByUser = async (req, res) => {
    try {
        const bookings = await bookingService.getBookingsByUser(
            req.params.userId
        );

        res.json({
            success: true,
            message: 'Data booking user berhasil diambil',
            data: bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data booking user',
            error: error.message
        });
    }
};

const createBooking = async (req, res) => {
    try {
        const booking = await bookingService.createBooking(req.body);

        res.status(201).json({
            success: true,
            message: 'Booking berhasil dibuat',
            data: booking
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const updateBooking = async (req, res) => {
    try {
        const booking = await bookingService.updateBooking(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: 'Booking berhasil diperbarui',
            data: booking
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const booking = await bookingService.updateBookingStatus(
            req.params.id,
            req.body.status
        );

        res.json({
            success: true,
            message: 'Status booking berhasil diperbarui',
            data: booking
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const deleteBooking = async (req, res) => {
    try {
        await bookingService.deleteBooking(req.params.id);

        res.json({
            success: true,
            message: 'Booking berhasil dihapus'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
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