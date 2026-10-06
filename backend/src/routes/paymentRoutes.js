const express = require('express');

const {
    getAllPayments,
    getPaymentById,
    getPaymentByBookingId,
    createPayment,
    submitPaymentProof,
    updatePayment,
    updatePaymentStatus,
    deletePayment
} = require('../controllers/paymentController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');
const uploadPaymentProof = require('../middleware/uploadPaymentProof');

const router = express.Router();

const handlePaymentProofUpload = (req, res, next) => {
    uploadPaymentProof.single('payment_proof')(
        req,
        res,
        (error) => {
            if (error) {
                const statusCode =
                    error.code === 'LIMIT_FILE_SIZE'
                        ? 413
                        : 400;

                return res.status(statusCode).json({
                    success: false,
                    message:
                        error.code === 'LIMIT_FILE_SIZE'
                            ? 'Ukuran bukti pembayaran maksimal 5 MB.'
                            : error.message,
                });
            }

            next();
        }
    );
};

router.get(
    '/',
    authMiddleware,
    adminMiddleware,
    getAllPayments
);

router.get(
    '/booking/:bookingId',
    authMiddleware,
    getPaymentByBookingId
);

router.get(
    '/:id',
    authMiddleware,
    adminMiddleware,
    getPaymentById
);

router.post(
    '/mine/proof',
    authMiddleware,
    userMiddleware,
    handlePaymentProofUpload,
    submitPaymentProof
);

router.post(
    '/',
    authMiddleware,
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