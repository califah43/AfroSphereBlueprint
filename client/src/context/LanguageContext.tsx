import { createContext, useState, useEffect, useContext } from "react";
import type { Language } from "@/lib/translations";
import { getTranslation } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Load from localStorage on startup
    const saved = localStorage.getItem("selectedLanguage") as Language | null;
    return saved || "en";
  });

  useEffect(() => {
    // Save to localStorage whenever language changes
    localStorage.setItem("selectedLanguage", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string) => getTranslation(language, key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
