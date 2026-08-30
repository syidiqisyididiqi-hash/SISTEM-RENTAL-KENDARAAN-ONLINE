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

const router = express.Router();

router.get('/', getAllPayments);

router.get('/booking/:bookingId', getPaymentByBookingId);

router.get('/:id', getPaymentById);

router.post('/', createPayment);

router.put('/:id', updatePayment);

router.patch('/:id/status', updatePaymentStatus);

router.delete('/:id', deletePayment);

module.exports = router;