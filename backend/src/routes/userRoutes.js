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

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);

router.put('/profile', authMiddleware, updateProfile);

router.get('/', getAllUsers);

router.post('/', createUser);

router.get('/customers', getCustomers);

router.get('/:id', getUserById);

router.put('/:id', updateUser);

router.delete('/:id', authMiddleware, deleteUser);

module.exports = router;