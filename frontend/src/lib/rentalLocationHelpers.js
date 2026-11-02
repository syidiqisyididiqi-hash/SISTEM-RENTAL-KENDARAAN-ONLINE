const API_ORIGIN = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
)
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");

export const unwrap = (res) => res?.data?.data ?? res?.data;

export const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || fallback;

export const resolveImage = (src) => {
    if (!src) return null;

    if (typeof src === "object") {
        src = src.url || src.path || src.filename;
    }

    if (typeof src !== "string" || !src.trim()) return null;

    const imagePath = src.trim();

    if (/^https?:\/\//i.test(imagePath)) {
        return imagePath;
    }

    const cleanPath = imagePath
        .replace(/^\/api\/?/, "")
        .replace(/^\/+/, "");

    const finalPath = cleanPath.includes("/")
        ? cleanPath
        : `uploads/locations/${cleanPath}`;

    return `${API_ORIGIN}/${finalPath}`;
};

export const setFlash = (message) => {
    try {
        sessionStorage.setItem("rental-location-flash", message);
    } catch {}
};