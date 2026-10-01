const userMiddleware = (req, res, next) => {
    if (req.user?.role !== 'user') {
        return res.status(403).json({
            success: false,
            message: 'Akses hanya untuk user'
        });
    }

    next();
};

module.exports = userMiddleware;