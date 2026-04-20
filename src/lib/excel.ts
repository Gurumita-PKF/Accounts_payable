import * as XLSX from "xlsx";
import { InvoiceRecord } from "@/pages/Index";

export function exportToExcel(records: InvoiceRecord[]) {
  const rows = records.map((r, idx) => ({
    "#": idx + 1,
    "File Name": r.fileName,
    "Invoice Number": r.invoice_number,
    "Invoice Date": r.invoice_date,
    "Seller Name": r.seller_name,
    "Seller GSTIN": r.seller_gstin,
    "Buyer Name": r.buyer_name,
    "Buyer GSTIN": r.buyer_gstin,
    "Taxable Amount": r.taxable_amount,
    CGST: r.cgst,
    SGST: r.sgst,
    IGST: r.igst,
    "Total Amount": r.total_amount,
    Currency: r.currency,
    Status: r.status,
  }));

  const sum = (k: keyof InvoiceRecord) =>
    records.reduce((acc, r) => acc + (Number(r[k]) || 0), 0);

  rows.push({
    "#": "" as any,
    "File Name": "TOTAL",
    "Invoice Number": "",
    "Invoice Date": "",
    "Seller Name": "",
    "Seller GSTIN": "",
    "Buyer Name": "",
    "Buyer GSTIN": "",
    "Taxable Amount": sum("taxable_amount") as any,
    CGST: sum("cgst") as any,
    SGST: sum("sgst") as any,
    IGST: sum("igst") as any,
    "Total Amount": sum("total_amount") as any,
    Currency: "",
    Status: "" as any,
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Invoices");

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `GST_Invoices_${today}.xlsx`);
}
