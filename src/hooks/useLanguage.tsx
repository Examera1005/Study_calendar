import { enUS, fr } from "date-fns/locale";
import type React from "react";
import { createContext, use, useCallback, useMemo, useState } from "react";
import { type TranslationSchema, translations } from "../i18n/translations";

type Language = "en" | "fr";

interface LanguageContextType {
	language: Language;
	setLanguage: (lang: Language) => void;
	t: TranslationSchema;
	dateLocale: typeof fr | typeof enUS;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
	undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
	const [language, setLanguageState] = useState<Language>(() => {
		const saved = localStorage.getItem("language");
		if (saved === "en" || saved === "fr") return saved;
		return "en";
	});

	const setLanguage = useCallback((lang: Language) => {
		setLanguageState(lang);
		localStorage.setItem("language", lang);
	}, []);

	const t = translations[language];
	const dateLocale = language === "en" ? enUS : fr;

	const contextValue = useMemo(
		() => ({
			language,
			setLanguage,
			t,
			dateLocale,
		}),
		[language, setLanguage, t, dateLocale],
	);

	return (
		<LanguageContext.Provider value={contextValue}>
			{children}
		</LanguageContext.Provider>
	);
}

export function useLanguage() {
	const context = use(LanguageContext);
	if (!context) {
		throw new Error("useLanguage must be used within a LanguageProvider");
	}
	return context;
}
export type { Language };
