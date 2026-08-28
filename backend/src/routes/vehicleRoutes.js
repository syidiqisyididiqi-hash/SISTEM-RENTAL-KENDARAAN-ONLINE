const express = require('express');

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

router.post('/', createVehicle);

router.put('/:id', updateVehicle);

router.delete('/:id', deleteVehicle);

module.exports = router;