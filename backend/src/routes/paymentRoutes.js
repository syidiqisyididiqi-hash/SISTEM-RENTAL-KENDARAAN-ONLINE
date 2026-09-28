const express = require('express');

const {
    getAllPayments,
    getPaymentById,
    getPaymentByBookingId,
    createPayment,
    updatePayment,
    updatePaymentStatus,
    deletePayment
} = require('../controllers/paymentController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get(
    '/',
    authMiddleware,
    adminMiddleware,
    getAllPayments
);

router.get(
    '/booking/:bookingId',
    authMiddleware,
    adminMiddleware,
    getPaymentByBookingId
);

router.get(
    '/:id',
    authMiddleware,
    adminMiddleware,
    getPaymentById
);

router.post(
    '/',
    authMiddleware,
    adminMiddleware,
    createPayment
);

router.put(
    '/:id',
    authMiddleware,
    adminMiddleware,
    updatePayment
);

router.patch(
    '/:id/status',
    authMiddleware,
    adminMiddleware,
    updatePaymentStatus
);

router.delete(
    '/:id',
    authMiddleware,
    adminMiddleware,
    deletePayment
);

module.exports = router;