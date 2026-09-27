const ExcelJS = require("exceljs");

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
    return Number(value || 0);
};

const generateMonthlyReportExcel = async (report) => {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = "Sistem Rental Kendaraan";
    workbook.created = new Date();

    const periodName = `${monthNames[report.period.month - 1]} ${report.period.year}`;

    /*
    |--------------------------------------------------------------------------
    | Sheet 1 - Ringkasan
    |--------------------------------------------------------------------------
    */

    const summarySheet = workbook.addWorksheet("Ringkasan");

    summarySheet.mergeCells("A1:B1");
    summarySheet.getCell("A1").value =
        "LAPORAN BULANAN RENTAL KENDARAAN";

    summarySheet.getCell("A1").font = {
        bold: true,
        size: 16,
    };

    summarySheet.getCell("A1").alignment = {
        horizontal: "center",
    };

    summarySheet.mergeCells("A2:B2");
    summarySheet.getCell("A2").value = periodName;

    summarySheet.getCell("A2").alignment = {
        horizontal: "center",
    };

    summarySheet.addRow([]);

    summarySheet.addRow(["Statistik", "Jumlah"]);

    summarySheet.addRow([
        "Total Pemesanan",
        report.statistics.total_bookings,
    ]);

    summarySheet.addRow([
        "Total Nilai Booking",
        formatCurrency(report.statistics.total_booking_value),
    ]);

    summarySheet.addRow([
        "Total Pembayaran",
        report.statistics.total_payments,
    ]);

    summarySheet.addRow([
        "Total Pendapatan",
        formatCurrency(report.statistics.total_revenue),
    ]);

    summarySheet.getRow(4).font = {
        bold: true,
    };

    summarySheet.getColumn(1).width = 30;
    summarySheet.getColumn(2).width = 25;

    summarySheet.getCell("B6").numFmt = '"Rp" #,##0';
    summarySheet.getCell("B8").numFmt = '"Rp" #,##0';

    /*
    |--------------------------------------------------------------------------
    | Sheet 2 - Status Booking
    |--------------------------------------------------------------------------
    */

    const bookingSheet = workbook.addWorksheet("Status Booking");

    bookingSheet.addRow(["Status", "Jumlah"]);

    Object.entries(report.bookingSummary).forEach(([status, total]) => {
        bookingSheet.addRow([
            status.charAt(0).toUpperCase() + status.slice(1),
            total,
        ]);
    });

    bookingSheet.getRow(1).font = {
        bold: true,
    };

    bookingSheet.getColumn(1).width = 20;
    bookingSheet.getColumn(2).width = 15;

    /*
    |--------------------------------------------------------------------------
    | Sheet 3 - Status Pembayaran
    |--------------------------------------------------------------------------
    */

    const paymentSheet = workbook.addWorksheet("Status Pembayaran");

    paymentSheet.addRow(["Status", "Jumlah"]);

    Object.entries(report.paymentSummary).forEach(([status, total]) => {
        paymentSheet.addRow([
            status.charAt(0).toUpperCase() + status.slice(1),
            total,
        ]);
    });

    paymentSheet.getRow(1).font = {
        bold: true,
    };

    paymentSheet.getColumn(1).width = 20;
    paymentSheet.getColumn(2).width = 15;

    /*
    |--------------------------------------------------------------------------
    | Sheet 4 - Kendaraan
    |--------------------------------------------------------------------------
    */

    const vehicleSheet = workbook.addWorksheet("Kendaraan");

    vehicleSheet.addRow([
        "No",
        "Kendaraan",
        "Brand",
        "Model",
        "Total Booking",
        "Total Pendapatan",
    ]);

    report.vehicleRevenue.forEach((vehicle, index) => {
        vehicleSheet.addRow([
            index + 1,
            vehicle.vehicle_name,
            vehicle.brand,
            vehicle.model,
            vehicle.total_bookings,
            formatCurrency(vehicle.total_revenue),
        ]);
    });

    vehicleSheet.getRow(1).font = {
        bold: true,
    };

    vehicleSheet.getColumn(1).width = 8;
    vehicleSheet.getColumn(2).width = 25;
    vehicleSheet.getColumn(3).width = 20;
    vehicleSheet.getColumn(4).width = 20;
    vehicleSheet.getColumn(5).width = 15;
    vehicleSheet.getColumn(6).width = 20;

    vehicleSheet.getColumn(6).numFmt = '"Rp" #,##0';

    /*
    |--------------------------------------------------------------------------
    | Sheet 5 - Detail Booking
    |--------------------------------------------------------------------------
    */

    const bookingDetailSheet = workbook.addWorksheet("Detail Booking");

    bookingDetailSheet.addRow([
        "No",
        "Pelanggan",
        "Kendaraan",
        "Tanggal Mulai",
        "Tanggal Selesai",
        "Total Hari",
        "Total Harga",
        "Status",
        "Tanggal Dibuat",
    ]);

    report.bookings.forEach((booking, index) => {
        bookingDetailSheet.addRow([
            index + 1,
            booking.user_name,
            booking.vehicle_name,
            booking.start_date,
            booking.end_date,
            booking.total_days,
            booking.total_price,
            booking.status,
            booking.created_at,
        ]);
    });

    bookingDetailSheet.getRow(1).font = {
        bold: true,
    };

    bookingDetailSheet.getColumn(1).width = 8;
    bookingDetailSheet.getColumn(2).width = 25;
    bookingDetailSheet.getColumn(3).width = 25;
    bookingDetailSheet.getColumn(4).width = 15;
    bookingDetailSheet.getColumn(5).width = 15;
    bookingDetailSheet.getColumn(6).width = 12;
    bookingDetailSheet.getColumn(7).width = 20;
    bookingDetailSheet.getColumn(8).width = 15;
    bookingDetailSheet.getColumn(9).width = 20;

    bookingDetailSheet.getColumn(7).numFmt = '"Rp" #,##0';

    /*
    |--------------------------------------------------------------------------
    | Freeze Header
    |--------------------------------------------------------------------------
    */

    bookingSheet.views = [{ state: "frozen", ySplit: 1 }];
    paymentSheet.views = [{ state: "frozen", ySplit: 1 }];
    vehicleSheet.views = [{ state: "frozen", ySplit: 1 }];
    bookingDetailSheet.views = [{ state: "frozen", ySplit: 1 }];

    /*
    |--------------------------------------------------------------------------
    | Return Buffer
    |--------------------------------------------------------------------------
    */

    const buffer = await workbook.xlsx.writeBuffer();

    return Buffer.from(buffer);
};

module.exports = {
    generateMonthlyReportExcel,
};