const paymentService = require('../services/paymentService');

const getAllPayments = async (req, res) => {
    try {
        const payments = await paymentService.getAllPayments();

        res.status(200).json({
            success: true,
            message: 'Data pembayaran berhasil diambil',
            data: payments
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data pembayaran'
        });
    }
};

const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;

        const payment = await paymentService.getPaymentById(id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Pembayaran tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Data pembayaran berhasil diambil',
            data: payment
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data pembayaran'
        });
    }
};

const getPaymentByBookingId = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const payments = await paymentService.getPaymentByBookingId(bookingId);

        res.status(200).json({
            success: true,
            message: 'Data pembayaran booking berhasil diambil',
            data: payments
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data pembayaran booking'
        });
    }
};

const createPayment = async (req, res) => {
    try {
        const {
            booking_id,
            payment_method,
            payment_proof,
            amount
        } = req.body;

        if (!booking_id || !payment_method || !amount) {
            return res.status(400).json({
                success: false,
                message: 'booking_id, payment_method, dan amount wajib diisi'
            });
        }

        if (!['bank_transfer', 'cash'].includes(payment_method)) {
            return res.status(400).json({
                success: false,
                message: 'Metode pembayaran tidak valid'
            });
        }

        const payment = await paymentService.createPayment({
            booking_id,
            payment_method,
            payment_proof,
            amount
        });

        res.status(201).json({
            success: true,
            message: 'Pembayaran berhasil dibuat',
            data: payment
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal membuat pembayaran'
        });
    }
};

const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;

        const existingPayment = await paymentService.getPaymentById(id);

        if (!existingPayment) {
            return res.status(404).json({
                success: false,
                message: 'Pembayaran tidak ditemukan'
            });
        }

        const {
            payment_method,
            payment_proof,
            amount
        } = req.body;

        if (!payment_method || !amount) {
            return res.status(400).json({
                success: false,
                message: 'payment_method dan amount wajib diisi'
            });
        }

        if (!['bank_transfer', 'cash'].includes(payment_method)) {
            return res.status(400).json({
                success: false,
                message: 'Metode pembayaran tidak valid'
            });
        }

        const payment = await paymentService.updatePayment(id, {
            payment_method,
            payment_proof,
            amount
        });

        res.status(200).json({
            success: true,
            message: 'Pembayaran berhasil diperbarui',
            data: payment
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui pembayaran'
        });
    }
};

const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const existingPayment = await paymentService.getPaymentById(id);

        if (!existingPayment) {
            return res.status(404).json({
                success: false,
                message: 'Pembayaran tidak ditemukan'
            });
        }

        if (!['pending', 'paid', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status pembayaran tidak valid'
            });
        }

        const payment = await paymentService.updatePaymentStatus(id, status);

        res.status(200).json({
            success: true,
            message: 'Status pembayaran berhasil diperbarui',
            data: payment
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui status pembayaran'
        });
    }
};

const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;

        const existingPayment = await paymentService.getPaymentById(id);

        if (!existingPayment) {
            return res.status(404).json({
                success: false,
                message: 'Pembayaran tidak ditemukan'
            });
        }

        await paymentService.deletePayment(id);

        res.status(200).json({
            success: true,
            message: 'Pembayaran berhasil dihapus'
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Gagal menghapus pembayaran'
        });
    }
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