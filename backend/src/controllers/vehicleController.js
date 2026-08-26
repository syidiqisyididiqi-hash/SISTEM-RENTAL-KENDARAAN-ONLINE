const vehicleService = require('../services/vehicleService');

const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await vehicleService.getAllVehicles();

        res.status(200).json({
            success: true,
            message: 'Data kendaraan berhasil diambil',
            data: vehicles
        });
    } catch (error) {
        console.error('Get all vehicles error:', error);

        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data kendaraan',
            error: error.message
        });
    }
};

const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;

        const vehicle = await vehicleService.getVehicleById(id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Kendaraan tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Data kendaraan berhasil diambil',
            data: vehicle
        });
    } catch (error) {
        console.error('Get vehicle by id error:', error);

        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data kendaraan',
            error: error.message
        });
    }
};

const createVehicle = async (req, res) => {
    try {
        const {
            category_id,
            name,
            brand,
            license_plate,
            price_per_day
        } = req.body;

        if (
            !category_id ||
            !name ||
            !brand ||
            !license_plate ||
            !price_per_day
        ) {
            return res.status(400).json({
                success: false,
                message: 'category_id, name, brand, license_plate, dan price_per_day wajib diisi'
            });
        }

        const vehicle = await vehicleService.createVehicle(req.body);

        res.status(201).json({
            success: true,
            message: 'Kendaraan berhasil ditambahkan',
            data: vehicle
        });
    } catch (error) {
        console.error('Create vehicle error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Nomor plat kendaraan sudah digunakan'
            });
        }

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                success: false,
                message: 'Category tidak ditemukan'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan kendaraan',
            error: error.message
        });
    }
};

const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            category_id,
            name,
            brand,
            license_plate,
            price_per_day,
            status
        } = req.body;

        if (
            !category_id ||
            !name ||
            !brand ||
            !license_plate ||
            !price_per_day ||
            !status
        ) {
            return res.status(400).json({
                success: false,
                message: 'category_id, name, brand, license_plate, price_per_day, dan status wajib diisi'
            });
        }

        const validStatus = [
            'available',
            'rented',
            'maintenance'
        ];

        if (!validStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status harus available, rented, atau maintenance'
            });
        }

        const vehicle = await vehicleService.updateVehicle(
            id,
            req.body
        );

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Kendaraan tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Kendaraan berhasil diperbarui',
            data: vehicle
        });
    } catch (error) {
        console.error('Update vehicle error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Nomor plat kendaraan sudah digunakan'
            });
        }

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                success: false,
                message: 'Category tidak ditemukan'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui kendaraan',
            error: error.message
        });
    }
};

const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await vehicleService.deleteVehicle(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Kendaraan tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Kendaraan berhasil dihapus'
        });
    } catch (error) {
        console.error('Delete vehicle error:', error);

        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                success: false,
                message: 'Kendaraan tidak dapat dihapus karena masih digunakan oleh data lain'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Gagal menghapus kendaraan',
            error: error.message
        });
    }
};

const getAvailableVehicles = async (req, res) => {
    try {
        const vehicles = await vehicleService.getAvailableVehicles();

        res.status(200).json({
            success: true,
            message: 'Data kendaraan yang tersedia berhasil diambil',
            data: vehicles
        });
    } catch (error) {
        console.error('Get available vehicles error:', error);

        res.status(500).json({
            success: false,
            message: 'Gagal mengambil kendaraan yang tersedia',
            error: error.message
        });
    }
};

module.exports = {
    getAllVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getAvailableVehicles
};