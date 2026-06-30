"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { db, Invoice, Customer, Shop } from "@/lib/db";
import { useConfig } from "@/components/ThemeAndLanguageProvider";
import { formatDateString } from "@/lib/utils";
import { 
  PlusCircle, 
  FileText, 
  Users, 
  Store, 
  TrendingUp, 
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  CircleCheck,
  Clock
} from "lucide-react";

export default function Dashboard() {
  const { language } = useConfig();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [invList, custList, shopList] = await Promise.all([
          db.invoices.list(),
          db.customers.list(),
          db.shops.list(),
        ]);
        setInvoices(invList);
        setCustomers(custList);
        setShops(shopList);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const t = {
    en: {
      title: "Printing Shop Dashboard",
      subtitle: "Overview of your offset and digital printing operations",
      totalSales: "Total Sales",
      totalDue: "Total Due",
      totalPaid: "Total Paid",
      activeCust: "Customers",
      totalInvs: "Invoices",
      quickActions: "Quick Actions",
      newInv: "Create Invoice",
      newCust: "Add Customer",
      newShop: "Add Shop",
      recentInvs: "Recent Invoices",
      dueReminders: "Payment Reminders (Due Balance)",
      viewAll: "View All Invoices",
      noInvoices: "No invoices created yet. Create your first invoice in 30 seconds!",
      currency: "৳",
      paid: "PAID",
      partial: "PARTIAL",
      due: "DUE",
    },
    bn: {
      title: "প্রিন্টিং শপ ড্যাশবোর্ড",
      subtitle: "আপনার অফসেট ও ডিজিটাল প্রিন্টিং ব্যবসার সার্বিক চিত্র",
      totalSales: "মোট বিক্রি",
      totalDue: "মোট বকেয়া",
      totalPaid: "মোট আদায়",
      activeCust: "মোট কাস্টমার",
      totalInvs: "মোট ইনভয়েস",
      quickActions: "কুইক অ্যাকশন",
      newInv: "নতুন ইনভয়েস",
      newCust: "কাস্টমার যোগ করুন",
      newShop: "দোকান যোগ করুন",
      recentInvs: "সাম্প্রতিক ইনভয়েসসমূহ",
      dueReminders: "বকেয়া তাগাদা (পেমেন্ট রিমাইন্ডার)",
      viewAll: "সব ইনভয়েস দেখুন",
      noInvoices: "এখনও কোনো ইনভয়েস তৈরি করা হয়নি। ৩০ সেকেন্ডে আপনার প্রথম ইনভয়েস তৈরি করুন!",
      currency: "৳",
      paid: "পরিশোধিত",
      partial: "আংশিক",
      due: "বকেয়া",
    }
  }[language];

  // Calculations
  const totalSalesVal = invoices.reduce((acc, inv) => acc + (inv.paid + inv.due), 0);
  const totalPaidVal = invoices.reduce((acc, inv) => acc + inv.paid, 0);
  const totalDueVal = invoices.reduce((acc, inv) => acc + inv.due, 0);

  const getStatusBadge = (status: string) => {
    const labels = {
      PAID: t.paid,
      PARTIAL: t.partial,
      DUE: t.due,
    };
    const colors = {
      PAID: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-green-200 dark:border-green-800/30",
      PARTIAL: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30",
      DUE: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200 dark:border-red-800/30",
    }[status] || "bg-zinc-50 text-zinc-700";

    return (
      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border uppercase tracking-wider ${colors}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const formatCurrency = (val: number) => {
    return `${t.currency} ${val.toLocaleString(language === "bn" ? "bn-BD" : "en-US", { minimumFractionDigits: 0 })}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-[#0B3954] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          {t.title}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Sales */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 hover:border-sky-500/50 transition-all">
          <div className="p-3 bg-sky-50 dark:bg-sky-950/20 rounded-xl text-sky-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t.totalSales}</p>
            <h3 className="text-xl font-bold text-zinc-800 dark:text-white mt-0.5">{formatCurrency(totalSalesVal)}</h3>
          </div>
        </div>

        {/* Total Paid */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 hover:border-green-500/50 transition-all">
          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-xl text-green-600">
            <CircleCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t.totalPaid}</p>
            <h3 className="text-xl font-bold text-zinc-800 dark:text-white mt-0.5">{formatCurrency(totalPaidVal)}</h3>
          </div>
        </div>

        {/* Total Due */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 hover:border-red-500/50 transition-all">
          <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl text-red-600">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t.totalDue}</p>
            <h3 className="text-xl font-bold text-zinc-800 dark:text-white mt-0.5 text-red-600 dark:text-red-400">{formatCurrency(totalDueVal)}</h3>
          </div>
        </div>

        {/* Active Customers */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 hover:border-amber-500/50 transition-all">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-amber-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t.activeCust}</p>
            <h3 className="text-xl font-bold text-zinc-800 dark:text-white mt-0.5">{customers.length}</h3>
          </div>
        </div>

        {/* Total Invoices */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 hover:border-indigo-500/50 transition-all">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl text-indigo-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t.totalInvs}</p>
            <h3 className="text-xl font-bold text-zinc-800 dark:text-white mt-0.5">{invoices.length}</h3>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-850 dark:text-white mb-4 flex items-center gap-2">
          {t.quickActions}
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/invoices/new"
            className="flex items-center gap-2 px-5 py-3 bg-[#0B3954] hover:bg-[#072435] text-white font-bold rounded-xl shadow-md shadow-[#0B3954]/10 transition-all text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            {t.newInv}
          </Link>
          <Link
            href="/customers"
            className="flex items-center gap-2 px-5 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white font-bold rounded-xl transition-all text-sm border border-zinc-200/60 dark:border-zinc-700/50"
          >
            <Users className="w-4 h-4" />
            {t.newCust}
          </Link>
          <Link
            href="/shops"
            className="flex items-center gap-2 px-5 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white font-bold rounded-xl transition-all text-sm border border-zinc-200/60 dark:border-zinc-700/50"
          >
            <Store className="w-4 h-4" />
            {t.newShop}
          </Link>
        </div>
      </div>

      {/* Main Sections: Recent Invoices & Due Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Invoices list */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-850 dark:text-white">{t.recentInvs}</h2>
            <Link href="/invoices" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              {t.viewAll} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {invoices.length === 0 ? (
            <div className="py-8 text-center text-zinc-400 dark:text-zinc-500 text-sm">
              {t.noInvoices}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 text-xs font-semibold uppercase">
                    <th className="py-3 px-2">Invoice No</th>
                    <th className="py-3 px-2">Customer</th>
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2 text-right">Amount</th>
                    <th className="py-3 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-55">
                  {invoices.slice(0, 5).map((inv) => (
                    <tr key={inv.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-2 font-mono font-bold text-zinc-900 dark:text-white">
                        <Link href={`/invoices?search=${inv.invoice_number}`} className="hover:underline">
                          {inv.invoice_number}
                        </Link>
                      </td>
                      <td className="py-3 px-2 font-medium text-zinc-700 dark:text-zinc-300">
                        {inv.customer?.name || "Walk-in Customer"}
                      </td>
                      <td className="py-3 px-2 text-zinc-500 font-medium">
                        {formatDateString(inv.date)}
                      </td>
                      <td className="py-3 px-2 text-right font-bold font-mono text-zinc-900 dark:text-white">
                        {formatCurrency(inv.paid + inv.due)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {getStatusBadge(inv.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Due Reminders Sidebar */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-zinc-850 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {t.dueReminders}
          </h2>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {invoices.filter((inv) => inv.due > 0).length === 0 ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-8">No outstanding due balances.</p>
            ) : (
              invoices
                .filter((inv) => inv.due > 0)
                .slice(0, 6)
                .map((inv) => (
                  <div key={inv.id} className="p-3 border border-red-100 dark:border-red-950/20 bg-red-50/30 dark:bg-red-950/5 rounded-xl flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-mono font-black text-red-950 dark:text-red-400">{inv.invoice_number}</p>
                      <p className="text-sm font-bold text-zinc-800 dark:text-white">{inv.customer?.name || "Walk-in"}</p>
                      {inv.customer?.mobile && (
                        <p className="text-[10px] text-zinc-500 font-mono">{inv.customer.mobile}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-zinc-400 uppercase">Due</p>
                      <p className="font-extrabold text-sm text-red-600 dark:text-red-400 font-mono">{formatCurrency(inv.due)}</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
