import { useEffect } from "react";
import { LanguageContext } from "./LanguageContextValue";

export const LanguageProvider = ({ children }) => {
    useEffect(() => {
        document.documentElement.lang = "ar";
        document.documentElement.dir = "rtl";
    }, []);

    return (
        <LanguageContext.Provider value={{ isArabic: true }}>
            {children}
        </LanguageContext.Provider>
    );
};
