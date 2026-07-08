"use client";

import jsPDF from "jspdf";

interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
  size?: string;
  color?: string;
}

interface ReceiptData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  items: ReceiptItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  couponCode?: string | null;
  status: string;
  paymentMethod: string;
  date: string;
  address?: string;
}

/** Generate and download a PDF receipt for an order */
export function generateReceiptPDF(data: ReceiptData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const margin = 20;
  let y = 20;

  // Header — Brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(212, 141, 78); // #D48D4E gold
  doc.text("CLOTHING X", margin, y);
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.setFont("helvetica", "normal");
  doc.text("Premium Lifestyle Apparel", margin, y + 6);
  y += 18;

  // Receipt title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text("ORDER RECEIPT", margin, y);
  y += 8;

  // Separator line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Order info
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  const orderDate = new Date(data.date).toLocaleString();
  doc.text(`Order ID: ${data.orderId}`, margin, y);
  doc.text(`Date: ${orderDate}`, pageWidth - margin, y, { align: "right" });
  y += 6;
  doc.text(`Status: ${data.status}`, margin, y);
  doc.text(`Payment: ${data.paymentMethod}`, pageWidth - margin, y, { align: "right" });
  y += 10;

  // Customer info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text("Bill To:", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(data.customerName, margin, y);
  y += 5;
  doc.text(data.customerPhone, margin, y);
  y += 5;
  if (data.address) {
    const lines = doc.splitTextToSize(data.address, pageWidth - 2 * margin);
    doc.text(lines, margin, y);
    y += lines.length * 5;
  }
  y += 6;

  // Items table
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Table header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text("ITEM", margin, y);
  doc.text("QTY", 130, y, { align: "center" });
  doc.text("PRICE", 155, y, { align: "right" });
  doc.text("TOTAL", pageWidth - margin, y, { align: "right" });
  y += 5;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Items
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);
  data.items.forEach((item) => {
    const itemTotal = item.price * item.qty;
    const variant = [item.size, item.color].filter(Boolean).join(" · ");
    const name = variant ? `${item.name} (${variant})` : item.name;
    const lines = doc.splitTextToSize(name, 90);
    doc.text(lines, margin, y);
    doc.text(String(item.qty), 130, y, { align: "center" });
    doc.text(`${item.price.toLocaleString()} taka`, 155, y, { align: "right" });
    doc.text(`${itemTotal.toLocaleString()} taka`, pageWidth - margin, y, { align: "right" });
    y += Math.max(5, lines.length * 5) + 2;
  });

  y += 4;
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Totals
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text("Subtotal:", 140, y);
  doc.text(`${data.subtotal.toLocaleString()} taka`, pageWidth - margin, y, { align: "right" });
  y += 6;

  if (data.discount > 0) {
    doc.setTextColor(212, 141, 78);
    doc.text(`Discount${data.couponCode ? ` (${data.couponCode})` : ""}:`, 140, y);
    doc.text(`− ${data.discount.toLocaleString()} taka`, pageWidth - margin, y, { align: "right" });
    y += 6;
    doc.setTextColor(60, 60, 60);
  }

  doc.text("Delivery:", 140, y);
  doc.text(`${data.deliveryCharge.toLocaleString()} taka`, pageWidth - margin, y, { align: "right" });
  y += 8;

  // Grand total
  doc.setDrawColor(212, 141, 78);
  doc.setLineWidth(0.8);
  doc.line(140, y, pageWidth - margin, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text("Total:", 140, y);
  doc.text(`${data.total.toLocaleString()} taka`, pageWidth - margin, y, { align: "right" });
  y += 15;

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Thank you for shopping with CLOTHING X!", margin, y);
  y += 4;
  doc.text("Cash on Delivery · Bangladesh only · 7-day refund policy", margin, y);
  y += 4;
  doc.text("hello@clothingx.com · +880 1700 000000 · Gulshan, Dhaka", margin, y);

  // Save
  doc.save(`receipt-${data.orderId}.pdf`);
}

/** Print receipt (opens print dialog) */
export function printReceipt(data: ReceiptData) {
  generateReceiptPDF(data);
  // The PDF downloads; user can print it from their PDF viewer
}
