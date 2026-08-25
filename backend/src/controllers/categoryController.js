const categoryService = require("../services/categoryService");

const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();

        res.status(200).json({
            success: true,
            message: "Berhasil mengambil semua kategori",
            data: categories
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil data kategori"
        });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await categoryService.getCategoryById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Kategori tidak ditemukan"
            });
        }

        res.status(200).json({
            success: true,
            message: "Berhasil mengambil kategori",
            data: category
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil kategori"
        });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Nama kategori wajib diisi"
            });
        }

        const category = await categoryService.createCategory(
            name,
            description || null
        );

        res.status(201).json({
            success: true,
            message: "Kategori berhasil dibuat",
            data: category
        });
    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Nama kategori sudah digunakan"
            });
        }

        res.status(500).json({
            success: false,
            message: "Gagal membuat kategori"
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const existingCategory =
            await categoryService.getCategoryById(id);

        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Kategori tidak ditemukan"
            });
        }

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Nama kategori wajib diisi"
            });
        }

        const category = await categoryService.updateCategory(
            id,
            name,
            description || null
        );

        res.status(200).json({
            success: true,
            message: "Kategori berhasil diperbarui",
            data: category
        });
    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Nama kategori sudah digunakan"
            });
        }

        res.status(500).json({
            success: false,
            message: "Gagal memperbarui kategori"
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const existingCategory =
            await categoryService.getCategoryById(id);

        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Kategori tidak ditemukan"
            });
        }

        await categoryService.deleteCategory(id);

        res.status(200).json({
            success: true,
            message: "Kategori berhasil dihapus"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal menghapus kategori"
        });
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};