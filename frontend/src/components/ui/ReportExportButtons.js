"use client";

import { FileDown, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import reportService from "@/services/reportService";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";

const ReportExportButtons = ({ month, year }) => {
    const [exportingPDF, setExportingPDF] = useState(false);
    const [exportingExcel, setExportingExcel] = useState(false);

    const [confirmPDF, setConfirmPDF] = useState(false);
    const [confirmExcel, setConfirmExcel] = useState(false);

    const [toast, setToast] = useState({
        show: false,
        type: "success",
        message: "",
    });

    const isExporting = exportingPDF || exportingExcel;
    const isDisabled = !month || !year || isExporting;

    const downloadFile = (blob, fileName) => {
        const url = window.URL.createObjectURL(blob);

        try {
            const link = document.createElement("a");

            link.href = url;
            link.download = fileName;

            document.body.appendChild(link);
            link.click();
            link.remove();
        } finally {
            window.URL.revokeObjectURL(url);
        }
    };

    const getFileName = (extension) => {
        return `laporan-rental-${year}-${String(month).padStart(
            2,
            "0"
        )}.${extension}`;
    };

    const handleExportPDF = async () => {
        if (isDisabled) return;

        try {
            setConfirmPDF(false);
            setExportingPDF(true);

            const response = await reportService.exportMonthlyPDF(
                month,
                year
            );

            downloadFile(
                response.data,
                getFileName("pdf")
            );

            setToast({
                show: true,
                type: "success",
                message: "Laporan PDF berhasil diexport.",
            });
        } catch (error) {
            console.error("Gagal export PDF:", error);

            setToast({
                show: true,
                type: "error",
                message:
                    error.response?.data?.message ||
                    "Gagal melakukan export laporan PDF.",
            });
        } finally {
            setExportingPDF(false);
        }
    };

    const handleExportExcel = async () => {
        if (isDisabled) return;

        try {
            setConfirmExcel(false);
            setExportingExcel(true);

            const response = await reportService.exportMonthlyExcel(
                month,
                year
            );

            downloadFile(
                response.data,
                getFileName("xlsx")
            );

            setToast({
                show: true,
                type: "success",
                message: "Laporan Excel berhasil diexport.",
            });
        } catch (error) {
            console.error("Gagal export Excel:", error);

            setToast({
                show: true,
                type: "error",
                message:
                    error.response?.data?.message ||
                    "Gagal melakukan export laporan Excel.",
            });
        } finally {
            setExportingExcel(false);
        }
    };

    return (
        <>
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    type="button"
                    variant="danger"
                    onClick={() => setConfirmPDF(true)}
                    loading={exportingPDF}
                    disabled={!month || !year || exportingExcel}
                    title="Export laporan dalam format PDF"
                    aria-label="Export laporan dalam format PDF"
                    className="rounded-xl px-4 py-2.5 text-xs font-bold"
                >
                    {!exportingPDF && <FileDown size={16} />}
                    Export PDF
                </Button>

                <Button
                    type="button"
                    variant="success"
                    onClick={() => setConfirmExcel(true)}
                    loading={exportingExcel}
                    disabled={!month || !year || exportingPDF}
                    title="Export laporan dalam format Excel"
                    aria-label="Export laporan dalam format Excel"
                    className="rounded-xl px-4 py-2.5 text-xs font-bold"
                >
                    {!exportingExcel && (
                        <FileSpreadsheet size={16} />
                    )}
                    Export Excel
                </Button>
            </div>

            <ConfirmDialog
                open={confirmPDF}
                onCancel={() => setConfirmPDF(false)}
                onConfirm={handleExportPDF}
                title="Export Laporan PDF"
                message="Apakah Anda yakin ingin mengexport laporan PDF untuk periode yang dipilih?"
                confirmText="Ya, Export"
                cancelText="Batal"
            />

            <ConfirmDialog
                open={confirmExcel}
                onCancel={() => setConfirmExcel(false)}
                onConfirm={handleExportExcel}
                title="Export Laporan Excel"
                message="Apakah Anda yakin ingin mengexport laporan Excel untuk periode yang dipilih?"
                confirmText="Ya, Export"
                cancelText="Batal"
            />

            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() =>
                    setToast({
                        show: false,
                        type: "success",
                        message: "",
                    })
                }
            />
        </>
    );
};

export default ReportExportButtons;