const PDFDocument = require("pdfkit");

const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
];

const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
};

const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const formatStatus = (status) => {
    if (!status) return "-";

    return status.charAt(0).toUpperCase() + status.slice(1);
};

const generateMonthlyReportPDF = (report) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: "A4",
            margin: 40,
        });

        const chunks = [];

        doc.on("data", (chunk) => {
            chunks.push(chunk);
        });

        doc.on("end", () => {
            resolve(Buffer.concat(chunks));
        });

        doc.on("error", reject);

        const { period, statistics, bookingSummary, paymentSummary } =
            report;

        const periodName = `${monthNames[period.month - 1]} ${period.year}`;

        doc.fontSize(18)
            .font("Helvetica-Bold")
            .text("LAPORAN BULANAN RENTAL KENDARAAN", {
                align: "center",
            });

        doc.moveDown(0.5);

        doc.fontSize(12)
            .font("Helvetica")
            .text(periodName, {
                align: "center",
            });

        doc.moveDown(1.5);

        doc.fontSize(14)
            .font("Helvetica-Bold")
            .text("Ringkasan Laporan");

        doc.moveDown(0.5);

        doc.fontSize(10)
            .font("Helvetica")
            .text(`Total Pemesanan       : ${statistics.total_bookings}`)
            .text(
                `Total Nilai Booking   : ${formatCurrency(
                    statistics.total_booking_value
                )}`
            )
            .text(`Total Pembayaran      : ${statistics.total_payments}`)
            .text(
                `Total Pendapatan      : ${formatCurrency(
                    statistics.total_revenue
                )}`
            );

        doc.moveDown(1);

        doc.fontSize(14)
            .font("Helvetica-Bold")
            .text("Status Pemesanan");

        doc.moveDown(0.5);

        doc.fontSize(10)
            .font("Helvetica")
            .text(`Pending    : ${bookingSummary.pending}`)
            .text(`Confirmed  : ${bookingSummary.confirmed}`)
            .text(`Ongoing    : ${bookingSummary.ongoing}`)
            .text(`Completed  : ${bookingSummary.completed}`)
            .text(`Cancelled  : ${bookingSummary.cancelled}`)
            .text(`Rejected   : ${bookingSummary.rejected}`);

        doc.moveDown(1);

        doc.fontSize(14)
            .font("Helvetica-Bold")
            .text("Status Pembayaran");

        doc.moveDown(0.5);

        doc.fontSize(10)
            .font("Helvetica")
            .text(`Pending    : ${paymentSummary.pending}`)
            .text(`Paid       : ${paymentSummary.paid}`)
            .text(`Rejected   : ${paymentSummary.rejected}`);

        doc.moveDown(1);

        if (report.vehicleRevenue.length > 0) {
            doc.fontSize(14)
                .font("Helvetica-Bold")
                .text("Performa Kendaraan");

            doc.moveDown(0.5);

            report.vehicleRevenue.forEach((vehicle, index) => {
                doc.fontSize(10)
                    .font("Helvetica")
                    .text(
                        `${index + 1}. ${vehicle.vehicle_name} - ${
                            vehicle.brand
                        } ${vehicle.model}`
                    )
                    .text(
                        `   Booking: ${vehicle.total_bookings} | Pendapatan: ${formatCurrency(
                            vehicle.total_revenue
                        )}`
                    )
                    .moveDown(0.3);
            });
        }

        if (report.bookings.length > 0) {
            doc.addPage();

            doc.fontSize(14)
                .font("Helvetica-Bold")
                .text("Detail Pemesanan");

            doc.moveDown(0.7);

            report.bookings.forEach((booking, index) => {
                doc.fontSize(9)
                    .font("Helvetica-Bold")
                    .text(
                        `${index + 1}. ${booking.user_name} - ${
                            booking.vehicle_name
                        }`
                    );

                doc.font("Helvetica")
                    .text(
                        `   Periode: ${formatDate(
                            booking.start_date
                        )} - ${formatDate(booking.end_date)}`
                    )
                    .text(`   Durasi: ${booking.total_days} hari`)
                    .text(
                        `   Total: ${formatCurrency(booking.total_price)}`
                    )
                    .text(
                        `   Status: ${formatStatus(booking.status)}`
                    )
                    .moveDown(0.7);

                if (doc.y > 740 && index < report.bookings.length - 1) {
                    doc.addPage();
                }
            });
        }

        doc.fontSize(8)
            .font("Helvetica")
            .text(
                `Laporan dibuat pada ${new Date().toLocaleString("id-ID")}`,
                40,
                780,
                {
                    align: "center",
                    width: 515,
                }
            );

        doc.end();
    });
};

module.exports = {
    generateMonthlyReportPDF,
};