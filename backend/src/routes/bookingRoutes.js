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

const router = express.Router();

router.get('/', getAllBookings);

router.get('/user/:userId', getBookingsByUser);

router.get('/:id', getBookingById);

router.post('/', createBooking);

router.put('/:id', updateBooking);

router.patch('/:id/status', updateBookingStatus);

router.delete('/:id', deleteBooking);

module.exports = router;