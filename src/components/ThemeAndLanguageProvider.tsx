"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";
type Language = "en" | "bn";

interface ConfigContextProps {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
}

const ConfigContext = createContext<ConfigContextProps | undefined>(undefined);

export function ThemeAndLanguageProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load preference from localStorage
    const savedTheme = localStorage.getItem("app_theme") as Theme;
    const savedLang = localStorage.getItem("app_lang") as Language;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
    
    if (savedLang) {
      setLanguageState(savedLang);
    }
    
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("app_theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_lang", lang);
  };

  // Prevent flash or layout shifts
  if (!mounted) {
    return <div className="invisible">{children}</div>;
  }

  return (
    <ConfigContext.Provider value={{ theme, language, toggleTheme, setLanguage }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    return {
      theme: "light" as const,
      language: "en" as const,
      toggleTheme: () => {},
      setLanguage: () => {},
    };
  }
  return context;
}
