
const express = require("express");
const router = express.Router();

const rentalLocationController = require("../controllers/rentalLocationController");

router.get("/", rentalLocationController.getAll);
router.get("/:id", rentalLocationController.getById);

router.post("/", rentalLocationController.create);
router.put("/:id", rentalLocationController.update);
router.delete("/:id", rentalLocationController.remove);

router.patch("/:id/status", rentalLocationController.updateStatus);

module.exports = router;
