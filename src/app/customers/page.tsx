"use client";

import React, { useEffect, useState } from "react";
import { db, Customer, Invoice } from "@/lib/db";
import { useConfig } from "@/components/ThemeAndLanguageProvider";
import { 
  Users, 
  PlusCircle, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Phone, 
  Mail, 
  MapPin,
  TrendingDown,
  FileText
} from "lucide-react";

export default function CustomersPage() {
  const { language } = useConfig();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  const t = {
    en: {
      title: "Manage Customers",
      subtitle: "Customer records, contacts, and outstanding due balances",
      addCust: "Add New Customer",
      editCust: "Edit Customer Details",
      name: "Customer Name",
      address: "Address",
      mobile: "Mobile Number",
      email: "Email Address",
      save: "Save Customer",
      cancel: "Cancel",
      noCustomers: "No customers registered yet. Add a customer to get started.",
      deleteConfirm: "Are you sure you want to delete this customer?",
      dueBalance: "Due Balance",
      totalInvoices: "Invoices",
      currency: "৳",
    },
    bn: {
      title: "গ্রাহক পরিচালনা",
      subtitle: "গ্রাহকদের তালিকা, যোগাযোগের বিবরণ ও বকেয়া খতিয়ান",
      addCust: "নতুন গ্রাহক যোগ করুন",
      editCust: "গ্রাহকের বিবরণ এডিট করুন",
      name: "গ্রাহকের নাম",
      address: "ঠিকানা",
      mobile: "মোবাইল নম্বর",
      email: "ইমেইল ঠিকানা",
      save: "গ্রাহক সংরক্ষণ করুন",
      cancel: "বাতিল",
      noCustomers: "কোনো গ্রাহক নিবন্ধিত নেই। শুরু করতে গ্রাহক যোগ করুন।",
      deleteConfirm: "আপনি কি নিশ্চিতভাবে এই গ্রাহকটি ডিলিট করতে চান?",
      dueBalance: "মোট বকেয়া",
      totalInvoices: "ইনভয়েস",
      currency: "৳",
    }
  }[language];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [custList, invList] = await Promise.all([
        db.customers.list(),
        db.invoices.list(),
      ]);
      setCustomers(custList);
      setInvoices(invList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setName("");
    setAddress("");
    setMobile("");
    setEmail("");
    setEditId(null);
    setIsEditing(false);
  };

  const handleEdit = (cust: Customer) => {
    setEditId(cust.id);
    setName(cust.name);
    setAddress(cust.address || "");
    setMobile(cust.mobile || "");
    setEmail(cust.email || "");
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const customerData = {
      name,
      address,
      mobile,
      email,
    };

    try {
      if (editId) {
        await db.customers.update(editId, customerData);
      } else {
        await db.customers.create(customerData);
      }
      resetForm();
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.deleteConfirm)) {
      try {
        await db.customers.delete(id);
        await loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Helper to calculate statistics for a customer
  const getCustomerStats = (customerId: string) => {
    const custInvoices = invoices.filter((i) => i.customer_id === customerId);
    const dueBalance = custInvoices.reduce((sum, i) => sum + i.due, 0);
    return {
      invoiceCount: custInvoices.length,
      dueBalance,
    };
  };

  const formatCurrency = (val: number) => {
    return `${t.currency} ${val.toLocaleString(language === "bn" ? "bn-BD" : "en-US")}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            {t.title}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {t.subtitle}
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0B3954] hover:bg-[#072435] text-white font-bold rounded-xl shadow-md transition-all text-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            {t.addCust}
          </button>
        )}
      </div>

      {/* Editor Panel */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 max-w-2xl animate-fade-in">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3">
            {editId ? t.editCust : t.addCust}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.name} *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.mobile}</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-mono"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.address}</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0B3954] hover:bg-[#072435] text-white font-bold rounded-xl text-sm transition-all"
            >
              {t.save}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white font-bold rounded-xl text-sm transition-all"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      )}

      {/* Loading list */}
      {loading ? (
        <div className="flex flex-col items-center py-12 justify-center gap-3">
          <div className="w-8 h-8 border-4 border-[#0B3954] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-zinc-400">Loading customers...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 p-8 text-center border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-zinc-400">
          <Users className="w-10 h-10 mx-auto mb-2 text-zinc-300" />
          {t.noCustomers}
        </div>
      ) : (
        /* Customers List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((cust) => {
            const stats = getCustomerStats(cust.id);
            return (
              <div key={cust.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between gap-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                {/* Identity info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">{cust.name}</h3>
                      {cust.email && <p className="text-xs text-zinc-400 truncate">{cust.email}</p>}
                    </div>
                    
                    {/* Outstanding Due Badge */}
                    {stats.dueBalance > 0 && (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-150 dark:border-red-900/30 text-xs font-extrabold rounded-full">
                        <TrendingDown className="w-3.5 h-3.5" />
                        {formatCurrency(stats.dueBalance)}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    {cust.mobile && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="font-mono">{cust.mobile}</span>
                      </div>
                    )}
                    {cust.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 mt-0.5" />
                        <span>{cust.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info summary & action buttons */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center gap-4 text-xs">
                  <div className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500 font-semibold">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{stats.invoiceCount} {t.totalInvoices}</span>
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(cust)}
                      className="p-2 text-zinc-500 hover:text-[#0B3954] dark:hover:text-sky-400 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cust.id)}
                      className="p-2 text-zinc-500 hover:text-red-500 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
