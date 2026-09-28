const express = require('express');

const {
    createUser,
    getAllUsers,
    getCustomers,
    getUserById,
    updateUser,
    deleteUser,
    getProfile,
    updateProfile
} = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);

router.put('/profile', authMiddleware, updateProfile);

router.get(
    '/',
    authMiddleware,
    adminMiddleware,
    getAllUsers
);

router.post(
    '/',
    authMiddleware,
    adminMiddleware,
    createUser
);

router.get(
    '/customers',
    authMiddleware,
    adminMiddleware,
    getCustomers
);

router.get(
    '/:id',
    authMiddleware,
    adminMiddleware,
    getUserById
);

router.put(
    '/:id',
    authMiddleware,
    adminMiddleware,
    updateUser
);

router.delete(
    '/:id',
    authMiddleware,
    adminMiddleware,
    deleteUser
);

module.exports = router;