"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db, Shop, Customer, InvoiceItem } from "@/lib/db";
import { useConfig } from "@/components/ThemeAndLanguageProvider";
import SignaturePad from "@/components/SignaturePad";
import InvoiceTemplate from "@/components/InvoiceTemplates";
import { amountToWords } from "@/lib/numberToWords";
import { 
  Store, 
  User, 
  PlusCircle, 
  Trash2, 
  FileText, 
  Sparkles, 
  Languages, 
  ArrowLeft,
  Undo2,
  Save,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import canvasConfetti from "canvas-confetti";

export default function NewInvoice() {
  const router = useRouter();
  const { language } = useConfig();

  const [shops, setShops] = useState<Shop[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editInvoiceNumber, setEditInvoiceNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  // Form State
  const [selectedShopId, setSelectedShopId] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [templateId, setTemplateId] = useState(1);
  const [paperSize, setPaperSize] = useState<"A4" | "A5" | "HALF_A4">("A4");
  const [notes, setNotes] = useState("");

  // Table Items State
  const [items, setItems] = useState<Omit<InvoiceItem, "id" | "invoice_id">[]>([
    { description: "", quantity: 1, unit_price: 0, total: 0 }
  ]);

  // Payment Calculations
  const [discount, setDiscount] = useState(0);
  const [vat, setVat] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [paid, setPaid] = useState(0);

  // Signatures
  const [customerSignature, setCustomerSignature] = useState("");
  const [authorizedSignature, setAuthorizedSignature] = useState("");

  // Quick modals state
  const [showShopModal, setShowShopModal] = useState(false);
  const [newShopName, setNewShopName] = useState("");
  
  const [showCustModal, setShowCustModal] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustMobile, setNewCustMobile] = useState("");

  const t = {
    en: {
      title: "Create Smart Invoice",
      subtitle: "Configure shops, customers, tables, and generate printable receipts",
      shopSelect: "Select Shop",
      custSelect: "Select Customer",
      date: "Invoice Date",
      invoiceNumberLabel: "Invoice Number",
      template: "Invoice Template",
      paperSize: "Paper Print Size",
      itemsTitle: "Product & Services Table",
      addEntry: "Add New Row (or press Enter)",
      desc: "Item Description (Multi-line)",
      qty: "Qty",
      rate: "Rate",
      total: "Total",
      subtotal: "Subtotal",
      discount: "Discount",
      vat: "VAT %",
      advance: "Advance Payment",
      paid: "Paid Amount",
      due: "Due Amount",
      notes: "Invoice Notes / Terms",
      saveInvoice: "Save & Print Invoice",
      updateInvoice: "Update Invoice",
      livePreview: "Live Print Preview",
      amountInWords: "Amount in Words",
      quickShop: "Quick Shop",
      quickCust: "Quick Customer",
      name: "Name",
      mobile: "Mobile",
      close: "Close",
      save: "Save",
      successSave: "Invoice created successfully!",
      successUpdate: "Invoice updated successfully!",
      errorFill: "Please select a Shop and a Customer before saving.",
      editInvoice: "Edit Invoice",
      template1: "Classic Bangladeshi Receipt",
      template2: "Corporate Invoice",
      template3: "Printing Press Offset Bill",
      template4: "Colorful Modern Receipt",
      template5: "Minimal Monochrome Invoice",
    },
    bn: {
      title: "নতুন ইনভয়েস তৈরি",
      subtitle: "দোকান, কাস্টমার, প্রোডাক্ট টেবিল ও স্বাক্ষর যোগ করে ইনভয়েস তৈরি করুন",
      shopSelect: "দোকান নির্বাচন করুন",
      custSelect: "কাস্টমার নির্বাচন করুন",
      date: "ইনভয়েসের তারিখ",
      invoiceNumberLabel: "ইনভয়েস নম্বর",
      template: "ইনভয়েস টেমপ্লেট",
      paperSize: "প্রিন্ট পেপার সাইজ",
      itemsTitle: "প্রোডাক্ট ও সার্ভিস টেবিল",
      addEntry: "নতুন রো যোগ করুন (বা এন্টার চাপুন)",
      desc: "বিবরণ (মাল্টি-লাইন সাপোর্ট)",
      qty: "পরিমাণ",
      rate: "দর",
      total: "মোট",
      subtotal: "সর্বমোট",
      discount: "ডিসকাউন্ট",
      vat: "ভ্যাট %",
      advance: "অগ্রিম পেমেন্ট",
      paid: "পরিশোধিত পরিমাণ",
      due: "বকেয়া পরিমাণ",
      notes: "ইনভয়েস নোট / শর্তাবলী",
      saveInvoice: "ইনভয়েস সেভ ও প্রিন্ট করুন",
      updateInvoice: "ইনভয়েস আপডেট করুন",
      livePreview: "লাইভ প্রিন্ট প্রিভিউ",
      amountInWords: "কথায়",
      quickShop: "কুইক শপ",
      quickCust: "কুইক কাস্টমার",
      name: "নাম",
      mobile: "মোবাইল",
      close: "বন্ধ করুন",
      save: "সংরক্ষণ",
      successSave: "ইনভয়েস সফলভাবে তৈরি করা হয়েছে!",
      successUpdate: "ইনভয়েস সফলভাবে আপডেট করা হয়েছে!",
      errorFill: "ইনভয়েস সংরক্ষণ করার আগে দোকান এবং কাস্টমার নির্বাচন করুন।",
      editInvoice: "ইনভয়েস সম্পাদন করুন",
      template1: "ক্লাসিক বাংলাদেশী রশিদ বই",
      template2: "কর্পোরেট ইনভয়েস",
      template3: "প্রিন্টিং প্রেস অফসেট বিল",
      template4: "কালারফুল মডার্ন রশিদ",
      template5: "মিনিমাল সাদা-কালো ইনভয়েস",
    }
  }[language];

  useEffect(() => {
    async function initForm() {
      setLoading(true);
      
      let currentEditId: string | null = null;
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        currentEditId = params.get("edit");
        if (currentEditId) {
          setEditId(currentEditId);
        }
      }

      try {
        const [shopList, custList] = await Promise.all([
          db.shops.list(),
          db.customers.list(),
        ]);
        setShops(shopList);
        setCustomers(custList);

        if (currentEditId) {
          const inv = await db.invoices.get(currentEditId);
          if (inv) {
            setSelectedShopId(inv.shop_id || "");
            setSelectedCustomerId(inv.customer_id || "");
            setDate(inv.date);
            setTemplateId(inv.template_id);
            setPaperSize(inv.paper_size);
            setNotes(inv.notes || "");
            setDiscount(inv.discount);
            setVat(inv.vat);
            setAdvance(inv.advance);
            setPaid(inv.paid);
            setCustomerSignature(inv.customer_signature || "");
            setAuthorizedSignature(inv.authorized_signature || "");
            setEditInvoiceNumber(inv.invoice_number);
            setInvoiceNumber(inv.invoice_number);
            
            if (inv.items && inv.items.length > 0) {
              setItems(inv.items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total: item.total
              })));
            }
          }
        } else {
          if (shopList.length > 0) setSelectedShopId(shopList[0].id);
          if (custList.length > 0) setSelectedCustomerId(custList[0].id);
          const nextInvNum = await db.invoices.getNextInvoiceNumber();
          setInvoiceNumber(nextInvNum);
        }
      } catch (e) {
        console.error("Initialization failed:", e);
      } finally {
        setLoading(false);
      }
    }

    initForm();
  }, []);

  // Row Manipulation
  const handleItemChange = (index: number, field: string, val: string | number) => {
    const updated = [...items];
    const item = updated[index];
    
    if (field === "description") {
      item.description = val as string;
    } else if (field === "quantity") {
      item.quantity = Number(val);
      item.total = item.quantity * item.unit_price;
    } else if (field === "unit_price") {
      item.unit_price = Number(val);
      item.total = item.quantity * item.unit_price;
    }
    
    setItems(updated);
  };

  const addRow = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeRow = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Keyboard shortcut: Pressing Enter on Rate input adds a row
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addRow();
      // Wait a frame and focus on next row's description
      setTimeout(() => {
        const nextDesc = document.getElementById(`desc-${index + 1}`);
        nextDesc?.focus();
      }, 50);
    }
  };

  // Quick modals create
  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim()) return;
    try {
      const newShop = await db.shops.create({ name: newShopName });
      setShops([...shops, newShop]);
      setSelectedShopId(newShop.id);
      setNewShopName("");
      setShowShopModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    try {
      const newCust = await db.customers.create({
        name: newCustName,
        mobile: newCustMobile,
      });
      setCustomers([...customers, newCust]);
      setSelectedCustomerId(newCust.id);
      setNewCustName("");
      setNewCustMobile("");
      setShowCustModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + it.total, 0);
  const vatAmount = (subtotal - discount) * (vat / 100);
  const grandTotal = subtotal - discount + vatAmount;
  const due = grandTotal - advance - paid;

  // Assembly of invoice object for live preview rendering
  const activeShop = shops.find((s) => s.id === selectedShopId);
  const activeCustomer = customers.find((c) => c.id === selectedCustomerId);

  const previewInvoiceData = {
    id: "preview-temp",
    invoice_number: invoiceNumber || "INV-2026-XXXXX",
    date,
    customer_id: selectedCustomerId,
    shop_id: selectedShopId,
    subtotal,
    discount,
    vat,
    advance,
    paid,
    due,
    status: due <= 0 ? "PAID" : paid > 0 || advance > 0 ? "PARTIAL" : "DUE" as "PAID" | "PARTIAL" | "DUE",
    notes,
    amount_in_words: amountToWords(paid + due, language),
    customer_signature: customerSignature,
    authorized_signature: authorizedSignature,
    template_id: templateId,
    paper_size: paperSize,
    shop: activeShop,
    customer: activeCustomer,
    items: items.map((it, idx) => ({ ...it, sort_order: idx })),
  };

  const handleSave = async () => {
    if (!selectedShopId || !selectedCustomerId) {
      alert(t.errorFill);
      return;
    }

    try {
      let savedInvoiceNumber = "";
      if (editId) {
        const updated = await db.invoices.update(
          editId,
          {
            invoice_number: invoiceNumber,
            date,
            customer_id: selectedCustomerId,
            shop_id: selectedShopId,
            subtotal,
            discount,
            vat,
            advance,
            paid,
            due,
            status: due <= 0 ? "PAID" : paid > 0 || advance > 0 ? "PARTIAL" : "DUE",
            notes,
            amount_in_words: previewInvoiceData.amount_in_words,
            customer_signature: customerSignature,
            authorized_signature: authorizedSignature,
            template_id: templateId,
            paper_size: paperSize,
          },
          items
        );
        if (!updated) {
          throw new Error("Update returned null");
        }
        savedInvoiceNumber = invoiceNumber;
      } else {
        const created = await db.invoices.create(
          {
            invoice_number: invoiceNumber,
            date,
            customer_id: selectedCustomerId,
            shop_id: selectedShopId,
            subtotal,
            discount,
            vat,
            advance,
            paid,
            due,
            status: due <= 0 ? "PAID" : paid > 0 || advance > 0 ? "PARTIAL" : "DUE",
            notes,
            amount_in_words: previewInvoiceData.amount_in_words,
            customer_signature: customerSignature,
            authorized_signature: authorizedSignature,
            template_id: templateId,
            paper_size: paperSize,
          },
          items
        );
        savedInvoiceNumber = created.invoice_number;
      }
      
      // Fun success confetti
      canvasConfetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Redirect back to invoices list with search param set to reprint
      router.push(`/invoices?search=${savedInvoiceNumber}`);
    } catch (e) {
      console.error(e);
      alert(editId ? "Failed to update invoice." : "Failed to save invoice.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20 justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#0B3954] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-zinc-500">Loading selectors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              {editId ? `${t.editInvoice}: ${editInvoiceNumber}` : t.title}
            </h1>
            <p className="text-xs text-zinc-500">{t.subtitle}</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0B3954] hover:bg-[#072435] text-white font-extrabold rounded-xl shadow-lg shadow-[#0B3954]/10 transition-all text-sm cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {editId ? t.updateInvoice : t.saveInvoice}
        </button>
      </div>

      {/* Main split-pane content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Input form editors */}
        <div className="xl:col-span-7 space-y-6">
          {/* Shop & Customer selection selectors card */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Shop selection */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.shopSelect}</label>
                  <button type="button" onClick={() => setShowShopModal(true)} className="text-[10px] font-bold text-sky-600 hover:underline flex items-center gap-0.5">
                    + {t.quickShop}
                  </button>
                </div>
                <select
                  value={selectedShopId}
                  onChange={(e) => setSelectedShopId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-bold"
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Customer selection */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.custSelect}</label>
                  <button type="button" onClick={() => setShowCustModal(true)} className="text-[10px] font-bold text-sky-600 hover:underline flex items-center gap-0.5">
                    + {t.quickCust}
                  </button>
                </div>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-bold"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Invoice Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.date}</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-semibold font-mono"
                />
              </div>

              {/* Template selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.template}</label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-bold"
                >
                  <option value={1}>{t.template1}</option>
                  <option value={2}>{t.template2}</option>
                  <option value={3}>{t.template3}</option>
                  <option value={4}>{t.template4}</option>
                  <option value={5}>{t.template5}</option>
                </select>
              </div>

              {/* Paper print size selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.paperSize}</label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-bold"
                >
                  <option value="A4">A4 (Standard Portrait)</option>
                  <option value="A5">A5 (Half standard Portrait)</option>
                  <option value="HALF_A4">Half A4 (A4 Landscape aspect)</option>
                </select>
              </div>

              {/* Invoice Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.invoiceNumberLabel}</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-bold font-mono"
                />
              </div>
            </div>
          </div>

          {/* TABLE ROW ITEMS EDITOR CARD */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-[#0B3954] dark:text-sky-400 uppercase tracking-wide border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              {t.itemsTitle}
            </h2>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start border-b border-zinc-100 dark:border-zinc-800 pb-3 sm:border-none sm:pb-0">
                  <div className="col-span-12 sm:col-span-6 space-y-1">
                    <span className="sm:hidden text-[10px] font-bold text-zinc-400">SL {index + 1} - Description</span>
                    <textarea
                      id={`desc-${index}`}
                      rows={1}
                      placeholder="e.g. Notebook, 4 Color Print"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2 space-y-1">
                    <span className="sm:hidden text-[10px] font-bold text-zinc-400">Qty</span>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white text-right font-mono"
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2 space-y-1">
                    <span className="sm:hidden text-[10px] font-bold text-zinc-400">Rate</span>
                    <input
                      type="number"
                      min="0"
                      value={item.unit_price}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onChange={(e) => handleItemChange(index, "unit_price", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white text-right font-mono"
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-1.5 text-right py-2 text-sm font-bold text-zinc-800 dark:text-white font-mono">
                    <span className="sm:hidden text-[10px] font-bold text-zinc-400 block text-left">Total </span>
                    ৳{item.total.toLocaleString()}
                  </div>

                  <div className="col-span-1 py-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg"
                      title="Remove Row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addRow}
              className="w-full py-2.5 border border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-xl text-xs font-bold text-zinc-500 transition-all flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              {t.addEntry}
            </button>
          </div>

          {/* PAYMENT BREAKDOWNS CARD */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.discount}</label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.vat}</label>
              <input
                type="number"
                min="0"
                value={vat}
                onChange={(e) => setVat(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.advance}</label>
              <input
                type="number"
                min="0"
                value={advance}
                onChange={(e) => setAdvance(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.paid}</label>
              <input
                type="number"
                min="0"
                value={paid}
                onChange={(e) => setPaid(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-mono"
              />
            </div>

            {/* Calculations summaries */}
            <div className="sm:col-span-2 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 grid grid-cols-3 gap-2 text-center text-xs font-bold text-zinc-800 dark:text-zinc-200">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{t.subtotal}</span>
                <p className="text-base font-extrabold font-mono text-[#0B3954] dark:text-sky-400">৳{subtotal.toLocaleString()}</p>
              </div>
              <div className="space-y-1 border-l border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Total</span>
                <p className="text-base font-extrabold font-mono">৳{grandTotal.toLocaleString()}</p>
              </div>
              <div className="space-y-1 border-l border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{t.due}</span>
                <p className="text-base font-extrabold font-mono text-red-600 dark:text-red-400">৳{due.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* SIGNATURE PADS CARD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SignaturePad
              label={language === "bn" ? "গ্রাহকের স্বাক্ষর" : "Customer Signature"}
              value={customerSignature}
              onChange={setCustomerSignature}
              language={language}
            />
            <SignaturePad
              label={language === "bn" ? "অনুমোদিত স্বাক্ষর" : "Authorized Signature"}
              value={authorizedSignature}
              onChange={setAuthorizedSignature}
              language={language}
            />
          </div>

          {/* NOTES AND SAVE BUTTON */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.notes}</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Terms of payment, delivery dates..."
                className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
              />
            </div>
            <button
              onClick={handleSave}
              className="w-full py-3.5 bg-[#0B3954] hover:bg-[#072435] text-white font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-5 h-5" />
              {editId ? t.updateInvoice : t.saveInvoice}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive live template preview */}
        <div className="xl:col-span-5 space-y-4 no-print-wrapper hidden xl:block">
          <div className="sticky top-6 space-y-3">
            <h2 className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              {t.livePreview}
            </h2>
            
            <div className="bg-zinc-200 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-300 dark:border-zinc-850 shadow-inner flex justify-center overflow-x-auto min-h-[500px]">
              <div 
                className="bg-white text-zinc-950 shadow-xl border border-zinc-350 transition-all duration-300"
                style={{
                  width: paperSize === "A4" ? "210mm" : paperSize === "A5" ? "148mm" : "210mm",
                  minHeight: paperSize === "A4" ? "297mm" : paperSize === "A5" ? "210mm" : "148mm",
                  transform: "scale(0.58)",
                  transformOrigin: "top center",
                  marginBottom: "-350px", // correct height offset for scaled div
                }}
              >
                <InvoiceTemplate invoice={previewInvoiceData as any} language={language} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK CREATE SHOP MODAL */}
      {showShopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateShop} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl w-full max-w-sm space-y-4 shadow-xl">
            <h3 className="font-extrabold text-zinc-900 dark:text-white">{t.quickShop}</h3>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">{t.name} *</label>
              <input
                type="text"
                required
                value={newShopName}
                onChange={(e) => setNewShopName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-250 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowShopModal(false)}
                className="px-3 py-1.5 text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white font-bold rounded-lg"
              >
                {t.close}
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs bg-[#0B3954] hover:bg-[#072435] text-white font-bold rounded-lg"
              >
                {t.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QUICK CREATE CUSTOMER MODAL */}
      {showCustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateCustomer} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl w-full max-w-sm space-y-4 shadow-xl">
            <h3 className="font-extrabold text-zinc-900 dark:text-white">{t.quickCust}</h3>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">{t.name} *</label>
              <input
                type="text"
                required
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-250 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">{t.mobile}</label>
              <input
                type="text"
                value={newCustMobile}
                onChange={(e) => setNewCustMobile(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-250 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-mono"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowCustModal(false)}
                className="px-3 py-1.5 text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white font-bold rounded-lg"
              >
                {t.close}
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs bg-[#0B3954] hover:bg-[#072435] text-white font-bold rounded-lg"
              >
                {t.save}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
