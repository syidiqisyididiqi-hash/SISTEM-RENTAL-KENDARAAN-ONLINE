const userService = require('../services/userService');

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
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};