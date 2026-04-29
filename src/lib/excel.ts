import ExcelJS from "exceljs";
import { InvoiceRecord } from "@/pages/Index";

export interface InvoiceExcelRow {
  "File Name": string;
  "Invoice Number": string | null;
  "Invoice Date": string | null;
  "Month": string | null;
  "Financial Year": string | null;
  "Seller Name": string | null;
  "Seller GSTIN": string | null;
  "Buyer Name": string | null;
  "Buyer GSTIN": string | null;
  "Invoice Type": string | null;
  "Place of Supply": string | null;
  "HSN/SAC Code": string | null;
  "Taxable Value": number | null;
  "GST Rate (%)": number | null;
  "CGST Amount": number | null;
  "SGST Amount": number | null;
  "IGST Amount": number | null;
  "Total Invoice Value": number | null;
  "Reverse Charge": string | null;
  "Currency": string | null;
  "Status": string;
}

const HEADERS = [
  "File Name",
  "Invoice Number",
  "Invoice Date",
  "Month",
  "Financial Year",
  "Seller Name",
  "Seller GSTIN",
  "Buyer Name",
  "Buyer GSTIN",
  "Invoice Type",
  "Place of Supply",
  "HSN/SAC Code",
  "Taxable Value",
  "GST Rate (%)",
  "CGST Amount",
  "SGST Amount",
  "IGST Amount",
  "Total Invoice Value",
  "Reverse Charge",
  "Currency",
  "Status",
] as const;

// ============ Utility Functions for CA-Standard GST Format ============

/**
 * Derives month from invoice date in format "Sep-24"
 */
function getMonthFromDate(dateString: string | null): string | null {
  if (!dateString) return null;
  try {
    // Handle various date formats: DD-MM-YYYY, YYYY-MM-DD, DD/MM/YYYY, etc.
    let date: Date;
    
    if (dateString.includes("-") && !dateString.match(/\d{4}-\d{2}-\d{2}/)) {
      // DD-MM-YYYY format
      const [day, month, year] = dateString.split("-");
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else if (dateString.includes("/")) {
      // DD/MM/YYYY format
      const [day, month, year] = dateString.split("/");
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      // Try ISO format or other standard formats
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) return null;
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    return `${month}-${year}`;
  } catch {
    return null;
  }
}

/**
 * Calculates Financial Year based on Indian FY (Apr-Mar)
 * Returns format: "2023-24" for FY starting Apr 2023
 */
function getFinancialYear(dateString: string | null): string | null {
  if (!dateString) return null;
  try {
    let date: Date;
    
    if (dateString.includes("-") && !dateString.match(/\d{4}-\d{2}-\d{2}/)) {
      // DD-MM-YYYY format
      const [day, month, year] = dateString.split("-");
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else if (dateString.includes("/")) {
      // DD/MM/YYYY format
      const [day, month, year] = dateString.split("/");
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) return null;
    
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // If month is April (3) or later, FY starts this year
    // Otherwise, FY started last year
    const fyStart = month >= 3 ? year : year - 1;
    const fyEnd = fyStart + 1;
    
    return `${fyStart}-${fyEnd.toString().slice(-2)}`;
  } catch {
    return null;
  }
}

/**
 * Determines Invoice Type based on Buyer GSTIN
 * B2B if Buyer GSTIN exists, B2C otherwise
 */
function getInvoiceType(buyerGstin: string | null): string {
  return buyerGstin && buyerGstin.trim() ? "B2B" : "B2C";
}

/**
 * Calculates GST Rate (%) from tax amounts
 * If taxable value is 0 or null, returns null
 */
function calculateGSTRate(taxableValue: number | null, cgst: number | null, sgst: number | null, igst: number | null): number | null {
  if (!taxableValue || taxableValue === 0) return null;
  
  const totalTax = (cgst || 0) + (sgst || 0) + (igst || 0);
  if (totalTax === 0) return null;
  
  const gstRate = (totalTax / taxableValue) * 100;
  // Round to 2 decimal places
  return Math.round(gstRate * 100) / 100;
}

/**
 * Formats date to DD-MM-YYYY format for Excel
 */
function formatDateForExcel(dateString: string | null): string | null {
  if (!dateString) return null;
  try {
    let date: Date;
    
    if (dateString.includes("-") && !dateString.match(/\d{4}-\d{2}-\d{2}/)) {
      // DD-MM-YYYY format - already correct
      return dateString;
    } else if (dateString.includes("/")) {
      // DD/MM/YYYY format - convert to DD-MM-YYYY
      const [day, month, year] = dateString.split("/");
      return `${day}-${month}-${year}`;
    } else {
      // Try ISO format
      date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
  } catch {
    return dateString;
  }
}


export function toInvoiceExcelRow(record: InvoiceRecord): InvoiceExcelRow {
  const formattedDate = formatDateForExcel(record.invoice_date);
  
  return {
    "File Name": record.fileName,
    "Invoice Number": record.invoice_number,
    "Invoice Date": formattedDate,
    "Month": getMonthFromDate(record.invoice_date),
    "Financial Year": getFinancialYear(record.invoice_date),
    "Seller Name": record.seller_name,
    "Seller GSTIN": record.seller_gstin,
    "Buyer Name": record.buyer_name,
    "Buyer GSTIN": record.buyer_gstin,
    "Invoice Type": getInvoiceType(record.buyer_gstin),
    "Place of Supply": null, // Can be extracted from invoice if available
    "HSN/SAC Code": null, // Can be extracted from invoice if available
    "Taxable Value": record.taxable_amount,
    "GST Rate (%)": calculateGSTRate(record.taxable_amount, record.cgst, record.sgst, record.igst),
    "CGST Amount": record.cgst,
    "SGST Amount": record.sgst,
    "IGST Amount": record.igst,
    "Total Invoice Value": record.total_amount,
    "Reverse Charge": null, // Can be extracted from invoice if available
    "Currency": record.currency,
    "Status": record.status,
  };
}

function rowsFromRecords(records: InvoiceRecord[]): InvoiceExcelRow[] {
  return records.map((r) => toInvoiceExcelRow(r));
}


function applyBaseStyles(worksheet: ExcelJS.Worksheet, rowCount: number) {
  // Define column widths for CA-standard GST format
  worksheet.columns = [
    { key: "File Name", width: 20 },
    { key: "Invoice Number", width: 16 },
    { key: "Invoice Date", width: 14 },
    { key: "Month", width: 12 },
    { key: "Financial Year", width: 14 },
    { key: "Seller Name", width: 20 },
    { key: "Seller GSTIN", width: 16 },
    { key: "Buyer Name", width: 20 },
    { key: "Buyer GSTIN", width: 16 },
    { key: "Invoice Type", width: 12 },
    { key: "Place of Supply", width: 16 },
    { key: "HSN/SAC Code", width: 14 },
    { key: "Taxable Value", width: 14 },
    { key: "GST Rate (%)", width: 12 },
    { key: "CGST Amount", width: 14 },
    { key: "SGST Amount", width: 14 },
    { key: "IGST Amount", width: 14 },
    { key: "Total Invoice Value", width: 18 },
    { key: "Reverse Charge", width: 14 },
    { key: "Currency", width: 12 },
    { key: "Status", width: 12 },
  ];

  // Calculate the last column letter (U for 21 columns)
  const lastColLetter = String.fromCharCode(64 + HEADERS.length); // A=65, so 64+21=85=U

  // Title row
  worksheet.mergeCells(`A1:${lastColLetter}1`);
  worksheet.getCell("A1").value = "CA-Standard GST Invoice Report";
  worksheet.getCell("A1").font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  worksheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2E5090" }, // Professional blue
  };
  worksheet.getRow(1).height = 24;

  // Metadata row
  worksheet.mergeCells(`A2:${lastColLetter}2`);
  worksheet.getCell("A2").value = `Generated: ${new Date().toLocaleString()}`;
  worksheet.getCell("A2").font = { size: 10, color: { argb: "FF4B5563" } };
  worksheet.getCell("A2").alignment = { vertical: "middle", horizontal: "left" };

  // Empty row for spacing
  worksheet.getRow(3).height = 2;

  // Header row with formatting
  const headerRow = worksheet.getRow(4);
  HEADERS.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2E5090" }, // Matching professional blue
    };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "medium", color: { argb: "FF2E5090" } },
      left: { style: "thin", color: { argb: "FF2E5090" } },
      bottom: { style: "medium", color: { argb: "FF2E5090" } },
      right: { style: "thin", color: { argb: "FF2E5090" } },
    };
  });
  headerRow.height = 28; // Taller header for better readability

  // Data row formatting
  const startDataRow = 5;
  for (let r = startDataRow; r < startDataRow + rowCount; r += 1) {
    const row = worksheet.getRow(r);
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFCCCCCC" } },
        left: { style: "thin", color: { argb: "FFCCCCCC" } },
        bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
        right: { style: "thin", color: { argb: "FFCCCCCC" } },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: isNumericColumn(colNumber) ? "right" : "left",
        wrapText: false,
      };

      // Apply specific formatting for numeric columns
      if (isNumericColumn(colNumber)) {
        cell.numFmt = "#,##0.00";
      }

      // Apply date format for Invoice Date column (column 3)
      if (colNumber === 3) {
        cell.numFmt = 'dd-mm-yyyy';
      }
    });
    row.height = 20;
  }

  // Freeze panes at row 4 (header row)
  worksheet.views = [{ state: "frozen", ySplit: 4 }];

  // Apply AutoFilter
  worksheet.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: 4, column: HEADERS.length },
  };
}


// Helper function to identify numeric columns that need number formatting
function isNumericColumn(colNumber: number): boolean {
  // Columns that should be formatted as numbers:
  // 13 = Taxable Value
  // 14 = GST Rate (%)
  // 15 = CGST Amount
  // 16 = SGST Amount
  // 17 = IGST Amount
  // 18 = Total Invoice Value
  return colNumber >= 13 && colNumber <= 18;
}

async function downloadWorkbook(workbook: ExcelJS.Workbook, fileName: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function exportToExcel(records: InvoiceRecord[]) {
  const rows = rowsFromRecords(records);

  const sum = (k: keyof InvoiceRecord) =>
    records.reduce((acc, r) => acc + (Number(r[k]) || 0), 0);

  // Create TOTAL row with new CA-standard structure
  const totalRow: InvoiceExcelRow = {
    "File Name": "TOTAL",
    "Invoice Number": null,
    "Invoice Date": null,
    "Month": null,
    "Financial Year": null,
    "Seller Name": null,
    "Seller GSTIN": null,
    "Buyer Name": null,
    "Buyer GSTIN": null,
    "Invoice Type": null,
    "Place of Supply": null,
    "HSN/SAC Code": null,
    "Taxable Value": sum("taxable_amount"),
    "GST Rate (%)": null,
    "CGST Amount": sum("cgst"),
    "SGST Amount": sum("sgst"),
    "IGST Amount": sum("igst"),
    "Total Invoice Value": sum("total_amount"),
    "Reverse Charge": null,
    "Currency": null,
    "Status": "",
  };

  rows.push(totalRow);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Invoices");
  applyBaseStyles(worksheet, rows.length);

  rows.forEach((row, index) => {
    const excelRow = worksheet.getRow(index + 5);
    HEADERS.forEach((header, colIndex) => {
      excelRow.getCell(colIndex + 1).value = row[header] as ExcelJS.CellValue;
    });
    excelRow.height = 20;

    if (row["File Name"] === "TOTAL") {
      excelRow.font = { bold: true, size: 12 };
      excelRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFDE4D3" }, // Light orange for total row
      };
      // Reapply borders with bolder style for total row
      excelRow.eachCell((cell) => {
        cell.border = {
          top: { style: "medium", color: { argb: "FFD4A574" } },
          left: { style: "thin", color: { argb: "FFD4A574" } },
          bottom: { style: "medium", color: { argb: "FFD4A574" } },
          right: { style: "thin", color: { argb: "FFD4A574" } },
        };
      });
    }
  });

  const today = new Date().toISOString().slice(0, 10);
  await downloadWorkbook(workbook, `GST_Invoices_${today}.xlsx`);
}

export async function exportSingleInvoiceToExcel(record: InvoiceRecord) {
  const rows = [toInvoiceExcelRow(record)];
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Invoice");
  applyBaseStyles(worksheet, rows.length);

  const excelRow = worksheet.getRow(5);
  HEADERS.forEach((header, colIndex) => {
    excelRow.getCell(colIndex + 1).value = rows[0][header] as ExcelJS.CellValue;
  });
  excelRow.height = 20;

  const safeFileBase = (record.fileName || "invoice")
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "_");
  const today = new Date().toISOString().slice(0, 10);
  await downloadWorkbook(workbook, `GST_Invoice_${safeFileBase}_${today}.xlsx`);
}
