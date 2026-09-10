const userService = require('../services/userService');

const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nama, email, dan password wajib diisi'
            });
        }

        if (role && !['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Role harus user atau admin'
            });
        }

        const user = await userService.createUser({
            ...req.body,
            role: role || 'user'
        });

        return res.status(201).json({
            success: true,
            message: 'User berhasil ditambahkan',
            data: user
        });
    } catch (error) {
        console.error('Create user error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Email sudah digunakan'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Gagal menambahkan user',
            error: error.message
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();

        res.status(200).json({
            success: true,
            message: 'Data user berhasil diambil',
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data user',
            error: error.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Data user berhasil diambil',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data user',
            error: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        await userService.updateUser(req.params.id, req.body);

        const updatedUser = await userService.getUserById(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Data user berhasil diperbarui',
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui data user',
            error: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        await userService.deleteUser(req.params.id);

        res.status(200).json({
            success: true,
            message: 'User berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus user',
            error: error.message
        });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};