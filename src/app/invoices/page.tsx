"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { db, Invoice, Shop, Customer } from "@/lib/db";
import { useConfig } from "@/components/ThemeAndLanguageProvider";
import InvoiceTemplate from "@/components/InvoiceTemplates";
import { 
  FileText, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  Copy, 
  Trash2, 
  Share2, 
  Eye, 
  FileDown, 
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowLeft,
  ChevronRight,
  TrendingDown,
  Edit
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { createPortal } from "react-dom";
import { formatDateString } from "@/lib/utils";

export default function InvoicesHistory() {
  const { language } = useConfig();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [shopFilter, setShopFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Print/Preview Modal states
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const printCaptureRef = useRef<HTMLDivElement>(null);

  const t = {
    en: {
      title: "Invoice History",
      subtitle: "Search, duplicate, delete and export printing invoices",
      searchPlaceholder: "Search by number, customer, phone...",
      statusAll: "All Statuses",
      shopAll: "All Shops",
      paid: "PAID",
      partial: "PARTIAL",
      due: "DUE",
      noInvoices: "No matching invoices found.",
      actions: "Actions",
      preview: "Preview",
      print: "Print",
      pdf: "Download PDF",
      png: "Download PNG",
      share: "Share",
      edit: "Edit",
      duplicate: "Duplicate",
      delete: "Delete",
      deleteConfirm: "Are you sure you want to delete this invoice?",
      subtotal: "Subtotal",
      dueBalance: "Due",
      invoiceNo: "Invoice No",
      date: "Date",
      customer: "Customer",
      total: "Total",
      status: "Status",
      close: "Close",
      copied: "Invoice link copied to clipboard!",
      shareTitle: "Share Invoice",
    },
    bn: {
      title: "ইনভয়েস খতিয়ান",
      subtitle: "ইনভয়েসসমূহ অনুসন্ধান, ডুপ্লিকেট, ডিলিট ও রিপোর্ট এক্সপোর্ট করুন",
      searchPlaceholder: "ইনভয়েস নং, গ্রাহকের নাম বা মোবাইল দিয়ে খুঁজুন...",
      statusAll: "সকল পেমেন্ট স্ট্যাটাস",
      shopAll: "সকল দোকান",
      paid: "পরিশোধিত",
      partial: "আংশিক",
      due: "বকেয়া",
      noInvoices: "কোনো ইনভয়েস খুঁজে পাওয়া যায়নি।",
      actions: "অ্যাকশন",
      preview: "প্রিভিউ",
      print: "প্রিন্ট",
      pdf: "পিডিএফ ডাউনলোড",
      png: "ছবি ডাউনলোড (PNG)",
      share: "শেয়ার",
      edit: "সম্পাদনা",
      duplicate: "ডুপ্লিকেট",
      delete: "ডিলিট",
      deleteConfirm: "আপনি কি নিশ্চিতভাবে এই ইনভয়েসটি ডিলিট করতে চান?",
      subtotal: "সর্বমোট",
      dueBalance: "বকেয়া",
      invoiceNo: "ইনভয়েস নং",
      date: "তারিখ",
      customer: "গ্রাহক",
      total: "মোট পরিমাণ",
      status: "স্ট্যাটাস",
      close: "বন্ধ করুন",
      copied: "ইনভয়েস লিংকটি ক্লিপবোর্ডে কপি করা হয়েছে!",
      shareTitle: "ইনভয়েস শেয়ার করুন",
    }
  }[language];

  useEffect(() => {
    loadData();
    // Support deep link search parameter
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [invList, shopList] = await Promise.all([
        db.invoices.list(),
        db.shops.list(),
      ]);
      setInvoices(invList);
      setShops(shopList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Handle auto printing trigger
  useEffect(() => {
    if (printInvoice) {
      const handleAfterPrint = () => {
        setPrintInvoice(null);
      };
      window.addEventListener("afterprint", handleAfterPrint);

      const timer = setTimeout(() => {
        window.print();
      }, 500);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("afterprint", handleAfterPrint);
      };
    }
  }, [printInvoice]);

  const handleDelete = async (id: string) => {
    if (window.confirm(t.deleteConfirm)) {
      try {
        await db.invoices.delete(id);
        await loadData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDuplicate = async (invoice: Invoice) => {
    try {
      const { items = [], customer_id, shop_id, discount, vat, template_id, paper_size, notes } = invoice;
      
      // Calculate totals
      const subtotal = items.reduce((acc, it) => acc + it.total, 0);
      const vatAmount = (subtotal - discount) * (vat / 100);
      const totalAmount = subtotal - discount + vatAmount;

      const cleanItems = items.map((it) => ({
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unit_price,
        total: it.total,
      }));

      await db.invoices.create(
        {
          date: new Date().toISOString().split("T")[0],
          customer_id,
          shop_id,
          subtotal,
          discount,
          vat,
          advance: 0,
          paid: 0,
          due: totalAmount,
          status: "DUE",
          notes,
          template_id,
          paper_size,
        },
        cleanItems
      );
      await loadData();
    } catch (e) {
      console.error("Duplication failed:", e);
    }
  };

  const handleShare = (inv: Invoice) => {
    const link = `${window.location.origin}/invoices?search=${inv.invoice_number}`;
    navigator.clipboard.writeText(link);
    alert(t.copied);
  };

  const safeHtml2Canvas = async (element: HTMLElement, options: any) => {
    const originalGetComputedStyle = window.getComputedStyle;

    window.getComputedStyle = function (elt, pseudoElt) {
      const style = originalGetComputedStyle(elt, pseudoElt);
      return new Proxy(style, {
        get(target, prop) {
          if (prop === "getPropertyValue") {
            return function (propertyName: string) {
              const value = target.getPropertyValue(propertyName);
              if (typeof value === "string" && (value.includes("oklch(") || value.includes("lab("))) {
                if (propertyName.includes("background")) return "rgba(0, 0, 0, 0)";
                if (propertyName.includes("border")) return "rgb(228, 228, 230)";
                return "rgb(9, 9, 11)";
              }
              return value;
            };
          }

          const value = Reflect.get(target, prop);
          if (typeof value === "function") {
            return value.bind(target);
          }

          if (typeof value === "string" && (value.includes("oklch(") || value.includes("lab("))) {
            const propStr = prop.toString();
            if (propStr.includes("background")) return "rgba(0, 0, 0, 0)";
            if (propStr.includes("border")) return "rgb(228, 228, 230)";
            return "rgb(9, 9, 11)";
          }
          return value;
        },
      });
    };

    try {
      const canvas = await html2canvas(element, options);
      return canvas;
    } finally {
      window.getComputedStyle = originalGetComputedStyle;
    }
  };

  const handlePDFDownload = async (inv: Invoice) => {
    // Open preview in printable format and wait for it
    setPreviewInvoice(inv);
    setTimeout(async () => {
      const element = document.getElementById("invoice-capture-area");
      if (!element) return;
      try {
        const canvas = await safeHtml2Canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", inv.paper_size.toLowerCase() === "a4" ? "a4" : "a5");
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));
        pdf.save(`${inv.invoice_number}.pdf`);
      } catch (err) {
        console.error("PDF generation failed:", err);
      }
    }, 400);
  };

  const handlePNGDownload = async (inv: Invoice) => {
    setPreviewInvoice(inv);
    setTimeout(async () => {
      const element = document.getElementById("invoice-capture-area");
      if (!element) return;
      try {
        const canvas = await safeHtml2Canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `${inv.invoice_number}.png`;
        a.click();
      } catch (err) {
        console.error("PNG export failed:", err);
      }
    }, 400);
  };

  // Filter Logic
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.customer?.mobile || "").includes(searchQuery);
    
    const matchesStatus = statusFilter === "" || inv.status === statusFilter;
    const matchesShop = shopFilter === "" || inv.shop_id === shopFilter;
    const matchesDate = dateFilter === "" || inv.date === dateFilter;

    return matchesSearch && matchesStatus && matchesShop && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "text-green-700 bg-green-50 dark:bg-green-950/20 border-green-200";
      case "PARTIAL": return "text-amber-700 bg-amber-50 dark:bg-amber-950/20 border-amber-200";
      default: return "text-red-700 bg-red-50 dark:bg-red-950/20 border-red-200";
    }
  };

  const formatCurrency = (val: number) => {
    return `৳ ${val.toLocaleString(language === "bn" ? "bn-BD" : "en-US", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-8">
      {/* Printable Invoice Container Overlay */}
      {mounted && printInvoice && createPortal(
        <div className="print-area-wrapper fixed inset-0 z-[9999999] bg-white">
          <div className={`${
            printInvoice.paper_size === "A4" 
              ? "paper-a4" 
              : printInvoice.paper_size === "A5" 
                ? "paper-a5" 
                : "paper-half_a4"
          }`}>
            <InvoiceTemplate invoice={printInvoice} language={language} />
          </div>
        </div>,
        document.body
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          {t.title}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* Filters Panel */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-medium"
            />
          </div>

          {/* Shop Filter */}
          <select
            value={shopFilter}
            onChange={(e) => setShopFilter(e.target.value)}
            className="px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-medium"
          >
            <option value="">{t.shopAll}</option>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-medium"
          >
            <option value="">{t.statusAll}</option>
            <option value="PAID">{t.paid}</option>
            <option value="PARTIAL">{t.partial}</option>
            <option value="DUE">{t.due}</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-medium font-mono"
          />
        </div>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="flex flex-col items-center py-16 justify-center gap-3">
          <div className="w-8 h-8 border-4 border-[#0B3954] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-zinc-400">Loading invoices...</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 p-12 text-center border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-zinc-400">
          <FileText className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
          <p>{t.noInvoices}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-zinc-400 dark:text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase bg-zinc-50/50 dark:bg-zinc-900/50">
                  <th className="py-3.5 px-4">{t.invoiceNo}</th>
                  <th className="py-3.5 px-4">{t.date}</th>
                  <th className="py-3.5 px-4">{t.customer}</th>
                  <th className="py-3.5 px-4 text-right">{t.total}</th>
                  <th className="py-3.5 px-4 text-right">{t.dueBalance}</th>
                  <th className="py-3.5 px-4 text-center">{t.status}</th>
                  <th className="py-3.5 px-4 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                      {inv.invoice_number}
                    </td>
                    <td className="py-4 px-4 text-zinc-500 font-medium">
                      {formatDateString(inv.date)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-zinc-800 dark:text-zinc-300">
                        {inv.customer?.name || "Walk-in Customer"}
                      </div>
                      {inv.customer?.mobile && (
                        <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{inv.customer.mobile}</div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-bold font-mono">
                      {formatCurrency(inv.subtotal - inv.discount + (inv.subtotal - inv.discount) * (inv.vat / 100))}
                    </td>
                    <td className="py-4 px-4 text-right font-bold font-mono text-red-600 dark:text-red-400">
                      {inv.due > 0 ? formatCurrency(inv.due) : "-"}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-full border uppercase ${getStatusColor(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          className="p-1.5 text-zinc-500 hover:text-[#0B3954] dark:hover:text-sky-400 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          title={t.preview}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPrintInvoice(inv)}
                          className="p-1.5 text-zinc-500 hover:text-green-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          title={t.print}
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/invoices/new?edit=${inv.id}`}
                          className="p-1.5 text-zinc-500 hover:text-blue-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          title={t.edit}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(inv)}
                          className="p-1.5 text-zinc-500 hover:text-amber-500 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          title={t.duplicate}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShare(inv)}
                          className="p-1.5 text-zinc-500 hover:text-sky-500 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          title={t.share}
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-500 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          title={t.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print-wrapper overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-scale-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2 text-[#0B3954] dark:text-sky-400">
                <FileText className="w-5 h-5" />
                <span className="font-bold text-sm">
                  {previewInvoice.invoice_number} ({previewInvoice.paper_size})
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPrintInvoice(previewInvoice)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#0B3954] hover:bg-[#072435] text-white rounded-lg transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  {t.print}
                </button>
                <Link
                  href={`/invoices/new?edit=${previewInvoice.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                >
                  <Edit className="w-3.5 h-3.5" />
                  {t.edit}
                </Link>
                <button
                  onClick={() => handlePDFDownload(previewInvoice)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  PDF
                </button>
                <button
                  onClick={() => handlePNGDownload(previewInvoice)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-lg transition-all"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  PNG
                </button>
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-white rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto bg-zinc-100 dark:bg-zinc-950 flex justify-center">
              <div 
                id="invoice-capture-area" 
                className="bg-white text-zinc-950 shadow-lg border border-zinc-200 overflow-hidden"
                style={{
                  width: previewInvoice.paper_size === "A4" 
                    ? "210mm" 
                    : previewInvoice.paper_size === "A5" 
                      ? "148mm" 
                      : "210mm",
                  minHeight: previewInvoice.paper_size === "A4" 
                    ? "297mm" 
                    : previewInvoice.paper_size === "A5" 
                      ? "210mm" 
                      : "148mm",
                  transformOrigin: "top center",
                }}
              >
                <InvoiceTemplate invoice={previewInvoice} language={language} />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setPreviewInvoice(null)}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold rounded-xl text-sm"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
