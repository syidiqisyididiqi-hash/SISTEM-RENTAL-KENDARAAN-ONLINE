const express = require('express');

const {
    getAllBookings,
    getBookingById,
    getBookingsByUser,
    createBooking,
    updateBooking,
    updateBookingStatus,
    deleteBooking
} = require('../controllers/bookingController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get(
    '/',
    authMiddleware,
    adminMiddleware,
    getAllBookings
);

router.get(
    '/user/:userId',
    authMiddleware,
    adminMiddleware,
    getBookingsByUser
);

router.get(
    '/:id',
    authMiddleware,
    adminMiddleware,
    getBookingById
);

router.post(
    '/',
    authMiddleware,
    adminMiddleware,
    createBooking
);

router.put(
    '/:id',
    authMiddleware,
    adminMiddleware,
    updateBooking
);

router.patch(
    '/:id/status',
    authMiddleware,
    adminMiddleware,
    updateBookingStatus
);

router.delete(
    '/:id',
    authMiddleware,
    adminMiddleware,
    deleteBooking
);

module.exports = router;