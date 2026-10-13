const categoryService = require("../services/categoryService");


const getAllCategories = async (req, res) => {
    try {
        const {
            search = "",
            sortBy = "id",
            sortOrder = "asc",
            page = "1",
            limit = "10",
        } = req.query;

        const allowedSortBy = ["id", "name"];
        const safeSortBy = allowedSortBy.includes(sortBy)
            ? sortBy
            : "id";

        const safeSortOrder =
            String(sortOrder).toLowerCase() === "desc"
                ? "desc"
                : "asc";

        const parsedPage = Number.parseInt(page, 10);
        const parsedLimit = Number.parseInt(limit, 10);

        const safePage =
            Number.isInteger(parsedPage) && parsedPage > 0
                ? parsedPage
                : 1;

        const safeLimit =
            [10, 25, 50].includes(parsedLimit)
                ? parsedLimit
                : 10;

        const result = await categoryService.getAllCategories({
            search: String(search).trim(),
            sortBy: safeSortBy,
            sortOrder: safeSortOrder,
            page: safePage,
            limit: safeLimit,
        });

        res.status(200).json({
            success: true,
            message: "Berhasil mengambil kategori",
            data: result.categories,
            pagination: result.pagination,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil data kategori",
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

        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                success: false,
                message:
                    "Kategori tidak dapat dihapus karena masih digunakan oleh kendaraan."
            });
        }

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