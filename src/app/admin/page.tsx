"use client";

import React, { useState } from "react";
import { db } from "@/lib/db";
import { useConfig } from "@/components/ThemeAndLanguageProvider";
import { 
  Database, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Check, 
  X, 
  AlertCircle,
  RefreshCw,
  Sparkles
} from "lucide-react";
import canvasConfetti from "canvas-confetti";

export default function AdminPage() {
  const { language } = useConfig();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const t = {
    en: {
      title: "Admin Utilities & Backups",
      subtitle: "Import/Export data and download financial reports",
      backupTitle: "Database Backups",
      backupDesc: "Download a copy of all shops, customers, and invoice records locally as a JSON backup file.",
      backupBtn: "Download JSON Backup",
      restoreTitle: "Restore Database",
      restoreDesc: "Upload a previously exported JSON backup file to overwrite your current local database.",
      restoreBtn: "Restore from JSON",
      reportTitle: "Financial Reports",
      reportDesc: "Export all historical invoice records, totals, and due statements in standard formats.",
      exportExcel: "Export Invoices (CSV)",
      successBackup: "Database backup completed successfully!",
      successRestore: "Database restored successfully!",
      errorRestore: "Failed to restore database. Invalid backup file structure.",
      alertWarning: "Warning: Restoring data will overwrite all current shop, customer, and invoice information in this browser.",
      copied: "Backup copied to clipboard",
    },
    bn: {
      title: "অ্যাডমিন ও ব্যাকআপ",
      subtitle: "আপনার ডাটা ইম্পোর্ট/এক্সপোর্ট করুন এবং অর্থনৈতিক প্রতিবেদন ডাউনলোড করুন",
      backupTitle: "ডাটাবেস ব্যাকআপ",
      backupDesc: "আপনার সকল দোকান, কাস্টমার এবং ইনভয়েসের কপি লোকাল JSON ফাইল হিসেবে সংরক্ষণ করতে ডাউনলোড করুন।",
      backupBtn: "JSON ব্যাকআপ ডাউনলোড",
      restoreTitle: "ডাটাবেস রিস্টোর",
      restoreDesc: "পূর্বে ডাউনলোড করা JSON ব্যাকআপ ফাইলটি আপলোড করে আপনার লোকাল ডাটাবেস আপডেট করুন।",
      restoreBtn: "রিস্টোর করুন",
      reportTitle: "আর্থিক প্রতিবেদন",
      reportDesc: "আপনার সকল ইনভয়েস রেকর্ড, মোট আয় এবং বকেয়ার বিবরণ এক্সেল ফাইলে এক্সপোর্ট করুন।",
      exportExcel: "ইনভয়েস এক্সপোর্ট (CSV)",
      successBackup: "ডাটাবেস ব্যাকআপ সফলভাবে সম্পূর্ণ হয়েছে!",
      successRestore: "ডাটাবেস সফলভাবে রিস্টোর করা হয়েছে!",
      errorRestore: "ডাটাবেস রিস্টোর ব্যর্থ হয়েছে। ইনপুট ফাইলটি সঠিক নয়।",
      alertWarning: "সতর্কতা: রিস্টোর করলে বর্তমানের সকল তথ্য (দোকান, কাস্টমার, ইনভয়েস) মুছে নতুন ফাইল দ্বারা প্রতিস্থাপিত হবে।",
      copied: "ব্যাকআপ ক্লিপবোর্ডে কপি করা হয়েছে",
    }
  }[language];

  const triggerConfetti = () => {
    canvasConfetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#0B3954", "#D9EEF7", "#F4A300", "#E2F0D9"]
    });
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      const backupJson = await db.admin.backup();
      const blob = new Blob([backupJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `smart_invoice_backup_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccessMsg(t.successBackup);
      triggerConfetti();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to generate backup.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      try {
        const success = await db.admin.restore(content);
        if (success) {
          setSuccessMsg(t.successRestore);
          triggerConfetti();
          setTimeout(() => {
            setSuccessMsg("");
            window.location.href = "/";
          }, 2000);
        } else {
          setErrorMsg(t.errorRestore);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg(t.errorRestore);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = async () => {
    setLoading(true);
    try {
      const invoices = await db.invoices.list();
      
      // Define CSV headers
      const headers = [
        "Invoice Number",
        "Date",
        "Shop Name",
        "Customer Name",
        "Customer Mobile",
        "Subtotal",
        "Discount",
        "VAT Amount",
        "Advance",
        "Paid Amount",
        "Due Balance",
        "Status"
      ];

      // Format rows
      const rows = invoices.map((inv) => {
        const shopName = inv.shop?.name || "";
        const custName = inv.customer?.name || "Walk-in";
        const custMobile = inv.customer?.mobile || "";
        const vatAmt = (inv.subtotal - inv.discount) * (inv.vat / 100);
        return [
          inv.invoice_number,
          inv.date,
          `"${shopName.replace(/"/g, '""')}"`,
          `"${custName.replace(/"/g, '""')}"`,
          `"${custMobile}"`,
          inv.subtotal,
          inv.discount,
          vatAmt,
          inv.advance,
          inv.paid,
          inv.due,
          inv.status
        ];
      });

      // Assemble CSV string
      const csvContent = 
        "data:text/csv;charset=utf-8," + 
        [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `financial_report_${new Date().getFullYear()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerConfetti();
    } catch (e) {
      console.error(e);
      setErrorMsg("Export failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          {t.title}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/30 rounded-2xl flex items-center gap-3 font-semibold text-sm animate-bounce">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/30 rounded-2xl flex items-center gap-3 font-semibold text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Utility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Database */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between gap-6 hover:border-zinc-300 dark:hover:border-zinc-850 transition-all">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-[#0B3954] dark:text-sky-400" />
              {t.backupTitle}
            </h2>
            <p className="text-xs text-zinc-550 dark:text-zinc-450 leading-relaxed">
              {t.backupDesc}
            </p>
          </div>
          <button
            onClick={handleBackup}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-3 bg-[#0B3954] hover:bg-[#072435] text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-[#0B3954]/10 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {t.backupBtn}
          </button>
        </div>

        {/* Restore Database */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between gap-6 hover:border-zinc-300 dark:hover:border-zinc-850 transition-all">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-500" />
              {t.restoreTitle}
            </h2>
            <p className="text-xs text-zinc-550 dark:text-zinc-450 leading-relaxed mb-3">
              {t.restoreDesc}
            </p>
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/5 border border-amber-250 dark:border-amber-900/30 rounded-xl text-[10px] text-amber-800 dark:text-amber-400 leading-relaxed font-semibold">
              {t.alertWarning}
            </div>
          </div>
          <label className="flex items-center justify-center gap-2 py-3 bg-zinc-150 dark:bg-zinc-800 hover:bg-zinc-250 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold rounded-xl text-sm transition-all border border-zinc-200 dark:border-zinc-800 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{t.restoreBtn}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestore}
              className="hidden"
              disabled={loading}
            />
          </label>
        </div>

        {/* Reports Utility */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between gap-6 hover:border-zinc-300 dark:hover:border-zinc-850 transition-all md:col-span-2">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              {t.reportTitle}
            </h2>
            <p className="text-xs text-zinc-550 dark:text-zinc-450 leading-relaxed">
              {t.reportDesc}
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleExportCSV}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-green-600/10 disabled:opacity-50 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {t.exportExcel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
