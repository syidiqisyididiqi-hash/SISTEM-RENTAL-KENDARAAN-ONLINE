import api from "@/lib/axios";

const paymentSettingService = {
    get: () =>
        api.get("/payment-settings"),

    updateQris: (file) => {
        const formData = new FormData();

        formData.append("qris_image", file);

        return api.put(
            "/payment-settings/qris",
            formData
        );
    },

    deleteQris: () =>
        api.delete("/payment-settings/qris"),
};

export default paymentSettingService;