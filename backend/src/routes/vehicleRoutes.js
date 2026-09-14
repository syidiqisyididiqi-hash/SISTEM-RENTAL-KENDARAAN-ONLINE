const express = require('express');
const upload = require('../middleware/uploadMiddleware');

const {
    getAllVehicles,
    getAvailableVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
} = require('../controllers/vehicleController');

const router = express.Router();

router.get('/', getAllVehicles);

router.get('/available', getAvailableVehicles);

router.get('/:id', getVehicleById);

router.post('/', upload.single('image'), createVehicle);

router.put('/:id', upload.single('image'), updateVehicle);

router.delete('/:id', deleteVehicle);

module.exports = router;