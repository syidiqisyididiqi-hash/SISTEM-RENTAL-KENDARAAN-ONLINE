const express = require('express');

const {
    getAllBookings,
    getBookingById,
    getBookingsByUser,
    getMyBookings,
    getMyBookingById,
    cancelMyBooking,
    createBooking,
    updateBooking,
    updateBookingStatus,
    deleteBooking
} = require('../controllers/bookingController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');

const router = express.Router();

router.get(
    '/mine',
    authMiddleware,
    userMiddleware,
    getMyBookings
);

router.get(
    '/mine/:id',
    authMiddleware,
    userMiddleware,
    getMyBookingById
);

router.patch(
    '/mine/:id/cancel',
    authMiddleware,
    userMiddleware,
    cancelMyBooking
);

router.post(
    '/',
    authMiddleware,
    userMiddleware,
    createBooking
);

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