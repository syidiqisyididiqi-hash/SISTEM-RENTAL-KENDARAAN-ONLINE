const express = require("express");

const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getAllCategories
);

router.get(
    "/:id",
    authMiddleware,
    adminMiddleware,
    getCategoryById
);

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    createCategory
);

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    updateCategory
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteCategory
);

module.exports = router;