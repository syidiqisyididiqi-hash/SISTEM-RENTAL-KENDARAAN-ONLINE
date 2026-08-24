const authService = require('../services/authService');

const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone
        } = req.body;

        // Validasi sederhana
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, dan password wajib diisi'
            });
        }

        const result = await authService.register(
            name,
            email,
            password,
            phone
        );

        return res.status(201).json({
            success: true,
            message: 'Registrasi berhasil',
            data: result
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email dan password wajib diisi'
            });
        }

        const result = await authService.login(
            email,
            password
        );

        return res.status(200).json({
            success: true,
            message: 'Login berhasil',
            data: result
        });

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    register,
    login
};