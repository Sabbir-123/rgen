"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConfig } from "./ThemeAndLanguageProvider";
import { isSupabaseConfigured } from "@/lib/db";
import {
  LayoutDashboard,
  FileText,
  Users,
  Store,
  Database,
  Sun,
  Moon,
  Languages,
  Menu,
  X,
  Printer,
  Sparkles,
} from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { theme, language, toggleTheme, setLanguage } = useConfig();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isOnline = isSupabaseConfigured();

  const navigation = [
    { name: { en: "Dashboard", bn: "ড্যাশবোর্ড" }, href: "/", icon: LayoutDashboard },
    { name: { en: "Invoices", bn: "ইনভয়েসসমূহ" }, href: "/invoices", icon: FileText },
    { name: { en: "Customers", bn: "গ্রাহকগণ" }, href: "/customers", icon: Users },
    { name: { en: "Shops", bn: "দোকানসমূহ" }, href: "/shops", icon: Store },
    { name: { en: "Admin & Backups", bn: "এডমিন ও ব্যাকআপ" }, href: "/admin", icon: Database },
  ];

  const t = {
    en: {
      title: "Smart Invoice",
      dbModeOnline: "Supabase Connected",
      dbModeLocal: "Local Storage Mode",
      footer: "Developed for Bangladeshi Printing Shops",
    },
    bn: {
      title: "স্মার্ট ইনভয়েস",
      dbModeOnline: "সুপাবেস কানেক্টেড",
      dbModeLocal: "লোকাল স্টোরেজ মোড",
      footer: "বাংলাদেশী প্রিন্টিং প্রেসের জন্য তৈরি",
    }
  }[language];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row app-shell-root">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 no-print">
        {/* Brand */}
        <div className="h-16 flex items-center gap-2 px-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="p-1.5 rounded-lg bg-[#0B3954] text-white">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <span className="font-extrabold text-lg text-zinc-900 dark:text-white tracking-tight">
            {t.title}
          </span>
        </div>

        {/* Database Status */}
        <div className="px-4 py-2 mt-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
            isOnline 
              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800/30" 
              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/30"
          }`}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-amber-500"}`} />
            <span className="truncate">{isOnline ? t.dbModeOnline : t.dbModeLocal}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#0B3954] text-white shadow-md shadow-[#0B3954]/20"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-zinc-400"}`} />
                {item.name[language]}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="p-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-xl transition-all"
              title="Toggle Theme"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setLanguage(language === "en" ? "bn" : "en")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all border border-zinc-200 dark:border-zinc-800"
            >
              <Languages className="w-3.5 h-3.5" />
              {language === "en" ? "বাংলা" : "English"}
            </button>
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center pt-1 font-medium">
            {t.footer}
          </p>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between h-16 px-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 w-full no-print">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#0B3954] text-white">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-bold text-base text-zinc-900 dark:text-white tracking-tight">
            {t.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === "en" ? "bn" : "en")}
            className="p-2 text-zinc-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Languages className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 text-zinc-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-600 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm no-print" onClick={() => setMobileMenuOpen(false)}>
          <aside className="w-64 bg-white dark:bg-zinc-900 h-full flex flex-col p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <span className="font-extrabold text-lg text-[#0B3954] dark:text-sky-400">{t.title}</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-[#0B3954] text-white"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-850"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name[language]}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-400">
              {t.footer}
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto no-print-wrapper">
        {children}
      </main>
    </div>
  );
}
