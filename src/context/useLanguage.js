import { useContext } from "react";
import { LanguageContext } from "./LanguageContextValue";

export const useLanguage = () => useContext(LanguageContext);
