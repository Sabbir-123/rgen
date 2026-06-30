"use client";

import React, { useEffect, useState } from "react";
import { db, Shop } from "@/lib/db";
import { useConfig } from "@/components/ThemeAndLanguageProvider";
import { 
  Store, 
  PlusCircle, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  Upload
} from "lucide-react";

export default function ShopsPage() {
  const { language } = useConfig();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Form Fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [tin, setTin] = useState("");
  const [bin, setBin] = useState("");
  const [facebook, setFacebook] = useState("");
  const [footerText, setFooterText] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");

  const t = {
    en: {
      title: "Manage Shops",
      subtitle: "Configure business details and print logos for your shops",
      addShop: "Add New Shop",
      editShop: "Edit Shop Details",
      name: "Shop Name",
      category: "Category (e.g. Offset Press)",
      address: "Address",
      mobile: "Mobile Number",
      email: "Email Address",
      website: "Website URL",
      tin: "TIN (Taxpayer Identification No)",
      bin: "BIN (Business Identification No)",
      facebook: "Facebook Page URL",
      footer: "Custom Print Footer Text",
      payment: "Default Payment Details (e.g. Bkash)",
      logo: "Logo URL or base64 data",
      logoUpload: "Upload Shop Logo",
      logoRemove: "Remove Logo",
      save: "Save Shop",
      cancel: "Cancel",
      noShops: "No shops registered. Add a shop to get started.",
      deleteConfirm: "Are you sure you want to delete this shop?",
      successDelete: "Shop deleted successfully",
      successSave: "Shop details saved successfully",
    },
    bn: {
      title: "দোকানসমূহ পরিচালনা",
      subtitle: "আপনার প্রিন্টিং শপের বিবরণ ও প্রিন্ট লোগো কনফিগার করুন",
      addShop: "নতুন দোকান যোগ করুন",
      editShop: "দোকানের বিবরণ এডিট করুন",
      name: "দোকানের নাম",
      category: "ক্যাটাগরি (যেমন: অফসেট প্রেস)",
      address: "ঠিকানা",
      mobile: "মোবাইল নম্বর",
      email: "ইমেইল ঠিকানা",
      website: "ওয়েবসাইট লিংক",
      tin: "টিন (TIN) নম্বর",
      bin: "বিন (BIN) নম্বর",
      facebook: "ফেসবুক পেজ লিংক",
      footer: "ইনভয়েসের নিচের বার্তা (ফুটনোট)",
      payment: "ডিফল্ট পেমেন্ট তথ্য (যেমন: বিকাশ)",
      logo: "লোগো URL বা বেস৬৪ ডাটা",
      logoUpload: "লোগো আপলোড",
      logoRemove: "লোগো মুছুন",
      save: "দোকান সংরক্ষণ করুন",
      cancel: "বাতিল",
      noShops: "কোনো দোকান নিবন্ধিত নেই। শুরু করতে একটি দোকান যোগ করুন।",
      deleteConfirm: "আপনি কি নিশ্চিতভাবে এই দোকানটি ডিলিট করতে চান?",
      successDelete: "দোকান সফলভাবে ডিলিট করা হয়েছে",
      successSave: "দোকানের বিবরণ সফলভাবে সংরক্ষিত হয়েছে",
    }
  }[language];

  useEffect(() => {
    loadShops();
  }, []);

  async function loadShops() {
    setLoading(true);
    try {
      const data = await db.shops.list();
      setShops(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setName("");
    setCategory("");
    setAddress("");
    setMobile("");
    setEmail("");
    setWebsite("");
    setTin("");
    setBin("");
    setFacebook("");
    setFooterText("");
    setLogoUrl("");
    setPaymentDetails("");
    setEditId(null);
    setIsEditing(false);
  };

  const handleEdit = (shop: Shop) => {
    setEditId(shop.id);
    setName(shop.name);
    setCategory(shop.category || "");
    setAddress(shop.address || "");
    setMobile(shop.mobile || "");
    setEmail(shop.email || "");
    setWebsite(shop.website || "");
    setTin(shop.tin || "");
    setBin(shop.bin || "");
    setFacebook(shop.facebook || "");
    setFooterText(shop.footer_text || "");
    setLogoUrl(shop.logo_url || "");
    setPaymentDetails(shop.payment_details || "");
    setIsEditing(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const shopData = {
      name,
      category,
      address,
      mobile,
      email,
      website,
      tin,
      bin,
      facebook,
      footer_text: footerText,
      logo_url: logoUrl,
      payment_details: paymentDetails,
    };

    try {
      if (editId) {
        await db.shops.update(editId, shopData);
      } else {
        await db.shops.create(shopData);
      }
      resetForm();
      await loadShops();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.deleteConfirm)) {
      try {
        await db.shops.delete(id);
        await loadShops();
      } catch (err) {
        console.error(err);
      }
    }
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
            {t.addShop}
          </button>
        )}
      </div>

      {/* Editor Panel */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3">
            {editId ? t.editShop : t.addShop}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Columns */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.name} *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.category}</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.mobile}</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.website}</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.facebook}</label>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.tin}</label>
                <input
                  type="text"
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.bin}</label>
                <input
                  type="text"
                  value={bin}
                  onChange={(e) => setBin(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.footer}</label>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.payment}</label>
                <input
                  type="text"
                  placeholder="e.g. Bkash: 01716607988 (send Money)"
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            {/* Logo Column */}
            <div className="space-y-4 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/20 flex flex-col justify-between">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">{t.logoUpload}</label>
                
                {logoUrl ? (
                  <div className="relative border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-4 flex flex-col items-center justify-center">
                    <img src={logoUrl} alt="Shop logo preview" className="max-h-28 max-w-full object-contain mb-3" />
                    <button
                      type="button"
                      onClick={() => setLogoUrl("")}
                      className="px-3 py-1.5 text-xs text-red-500 border border-red-200 dark:border-red-950 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all font-bold"
                    >
                      {t.logoRemove}
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all">
                    <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                    <span className="text-xs text-zinc-500">{t.logoUpload}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-2 pt-4 border-t border-zinc-150 dark:border-zinc-800">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0B3954] hover:bg-[#072435] text-white font-bold rounded-xl text-sm transition-all"
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
            </div>
          </div>
        </form>
      )}

      {/* Loading list */}
      {loading ? (
        <div className="flex flex-col items-center py-12 justify-center gap-3">
          <div className="w-8 h-8 border-4 border-[#0B3954] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-zinc-400">Loading shops...</p>
        </div>
      ) : shops.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 p-8 text-center border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-zinc-400">
          <Store className="w-10 h-10 mx-auto mb-2 text-zinc-300" />
          {t.noShops}
        </div>
      ) : (
        /* Shops Grid list */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {shops.map((shop) => (
            <div key={shop.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between gap-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              {/* Header Info */}
              <div className="flex gap-4">
                {shop.logo_url ? (
                  <div className="w-16 h-16 border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-1.5 flex items-center justify-center flex-shrink-0">
                    <img src={shop.logo_url} alt="Shop logo" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-[#0B3954] to-[#125A84] rounded-xl flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
                    {shop.name[0]}
                  </div>
                )}
                
                <div className="space-y-1 min-w-0">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white truncate">{shop.name}</h3>
                  {shop.category && (
                    <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold bg-[#0B3954]/5 text-[#0B3954] dark:text-sky-300 dark:bg-sky-950/20 rounded-full">
                      {shop.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Grid details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-650 dark:text-zinc-400">
                {shop.address && (
                  <div className="flex items-start gap-2 col-span-2">
                    <MapPin className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                    <span>{shop.address}</span>
                  </div>
                )}
                {shop.mobile && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-zinc-400" />
                    <span className="font-mono">{shop.mobile}</span>
                  </div>
                )}
                {shop.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-zinc-400" />
                    <span className="truncate">{shop.email}</span>
                  </div>
                )}
                {shop.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-zinc-400" />
                    <span>{shop.website}</span>
                  </div>
                )}
                {shop.facebook && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-zinc-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="truncate">{shop.facebook}</span>
                  </div>
                )}
                {shop.payment_details && (
                  <div className="flex items-start gap-2 col-span-2 mt-1">
                    <span className="font-bold text-zinc-450 dark:text-zinc-500">{language === "bn" ? "পেমেন্ট তথ্য:" : "Payment:"}</span>
                    <span className="font-semibold text-[#0B3954] dark:text-sky-400">{shop.payment_details}</span>
                  </div>
                )}
              </div>

              {/* Footer text, BIN/TIN & actions */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center gap-4 text-xs">
                <div className="flex flex-wrap gap-2 text-[10px] font-mono text-zinc-400">
                  {shop.bin && <span>BIN: {shop.bin}</span>}
                  {shop.tin && <span>TIN: {shop.tin}</span>}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(shop)}
                    className="p-2 text-zinc-500 hover:text-[#0B3954] dark:hover:text-sky-400 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(shop.id)}
                    className="p-2 text-zinc-500 hover:text-red-500 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
