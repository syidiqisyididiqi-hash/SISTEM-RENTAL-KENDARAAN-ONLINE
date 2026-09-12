const express = require('express');

const {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getProfile,
    updateProfile
} = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Profile user yang sedang login
router.get('/profile', authMiddleware, getProfile);

router.put('/profile', authMiddleware, updateProfile);

// CRUD Users
router.get('/', getAllUsers);

router.post('/', createUser);

router.get('/:id', getUserById);

router.put('/:id', updateUser);

router.delete('/:id', deleteUser);

module.exports = router;