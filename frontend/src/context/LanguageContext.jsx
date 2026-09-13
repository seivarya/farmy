import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { ALL_LANGUAGES, DEFAULT_LANGUAGE, getLanguageByCode } from "../data/languages";

export const LanguageContext = createContext(null);

const STORAGE_KEY = "farmy_language";

// Safe DOM patch for React 18/19 when Google Translate modifies text nodes
function applyReactTranslationPatch() {
  if (typeof window === "undefined" || window.__farmy_gt_patched) return;
  window.__farmy_gt_patched = true;

  if (typeof Node === "function" && Node.prototype) {
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function (child) {
      if (child && child.parentNode !== this) {
        if (typeof console !== "undefined" && console.warn) {
          console.warn("[Farmy i18n] Safely prevented React removeChild mismatch on translated node.");
        }
        return child;
      }
      return originalRemoveChild.apply(this, arguments);
    };

    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function (newNode, referenceNode) {
      if (referenceNode && referenceNode.parentNode !== this) {
        if (typeof console !== "undefined" && console.warn) {
          console.warn("[Farmy i18n] Safely prevented React insertBefore mismatch on translated node.");
        }
        return newNode;
      }
      return originalInsertBefore.apply(this, arguments);
    };
  }
}

function setGoogleTransCookies(langCode) {
  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1";
  const domainParts = host.split(".");
  const rootDomain = domainParts.length > 1 ? `.${domainParts.slice(-2).join(".")}` : host;

  const value = `/en/${langCode}`;
  const autoValue = `/auto/${langCode}`;

  const setCookie = (name, val, domain) => {
    let cookie = `${name}=${val}; path=/; max-age=31536000; SameSite=Lax`;
    if (domain && !isLocal) {
      cookie += `; domain=${domain}`;
    }
    document.cookie = cookie;
  };

  setCookie("googtrans", value);
  setCookie("googtrans", autoValue);
  if (!isLocal) {
    setCookie("googtrans", value, rootDomain);
    setCookie("googtrans", autoValue, rootDomain);
  }
}

function clearGoogleTransCookies() {
  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1";
  const domainParts = host.split(".");
  const rootDomain = domainParts.length > 1 ? `.${domainParts.slice(-2).join(".")}` : host;

  const clearCookie = (name, domain) => {
    let cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    if (domain && !isLocal) {
      cookie += `; domain=${domain}`;
    }
    document.cookie = cookie;
  };

  clearCookie("googtrans");
  if (!isLocal) {
    clearCookie("googtrans", rootDomain);
  }
}

export function LanguageProvider({ children }) {
  const location = useLocation();

  const [currentLanguageCode, setCurrentLanguageCode] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_LANGUAGE.code;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || DEFAULT_LANGUAGE.code;
  });

  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // Apply React safe DOM patch on initialization
  useEffect(() => {
    applyReactTranslationPatch();
  }, []);

  // Sync Google Translate cookies on initial mount
  useEffect(() => {
    if (currentLanguageCode && currentLanguageCode !== "en") {
      setGoogleTransCookies(currentLanguageCode);
    }
  }, [currentLanguageCode]);

  // Load Google Translate script dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.googleTranslateElementInit = function () {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: ALL_LANGUAGES.map((l) => l.code).join(","),
            autoDisplay: false,
            layout: window.google.translate.TranslateElement.InlineLayout?.SIMPLE || 0,
          },
          "google_translate_element"
        );
        setIsScriptLoaded(true);
      }
    };

    const existingScript = document.getElementById("google-translate-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.onerror = () => {
        console.warn("[Farmy i18n] Google Translate script failed to load from primary CDN.");
      };
      document.body.appendChild(script);
    } else {
      setIsScriptLoaded(true);
    }
  }, []);

  // Programmatically trigger Google Translate combo change
  const triggerGoogleTranslate = useCallback((langCode) => {
    setIsTranslating(true);

    const combo = document.querySelector(".goog-te-combo");
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event("change", { bubbles: true }));
      setTimeout(() => setIsTranslating(false), 300);
      return true;
    }

    // If combo element isn't ready yet, poll briefly
    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      const el = document.querySelector(".goog-te-combo");
      if (el) {
        el.value = langCode;
        el.dispatchEvent(new Event("change", { bubbles: true }));
        clearInterval(interval);
        setTimeout(() => setIsTranslating(false), 300);
      } else if (attempts > 15) {
        clearInterval(interval);
        setIsTranslating(false);
      }
    }, 100);

    return false;
  }, []);

  const changeLanguage = useCallback(
    (code) => {
      const targetLang = getLanguageByCode(code);
      const targetCode = targetLang.code;

      setCurrentLanguageCode(targetCode);
      localStorage.setItem(STORAGE_KEY, targetCode);

      if (targetCode === "en") {
        clearGoogleTransCookies();
        setGoogleTransCookies("en");
      } else {
        setGoogleTransCookies(targetCode);
      }

      // Try setting combo directly if present
      const combo = document.querySelector(".goog-te-combo");
      if (combo) {
        combo.value = targetCode;
        combo.dispatchEvent(new Event("change", { bubbles: true }));
      }

      // Refresh the browser so the new language applies instantly and cleanly
      setTimeout(() => {
        window.location.reload();
      }, 50);
    },
    []
  );

  // When route changes, ensure translated state persists seamlessly on new view
  useEffect(() => {
    if (currentLanguageCode && currentLanguageCode !== "en") {
      setGoogleTransCookies(currentLanguageCode);
      const timer = setTimeout(() => {
        triggerGoogleTranslate(currentLanguageCode);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, currentLanguageCode, triggerGoogleTranslate]);

  const currentLanguage = useMemo(() => {
    return getLanguageByCode(currentLanguageCode);
  }, [currentLanguageCode]);

  const contextValue = useMemo(
    () => ({
      currentLanguage,
      currentLanguageCode,
      languages: ALL_LANGUAGES,
      changeLanguage,
      isTranslating,
      isScriptLoaded,
    }),
    [currentLanguage, currentLanguageCode, changeLanguage, isTranslating, isScriptLoaded]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
      {/* Hidden container for Google Translate Widget */}
      <div
        id="google_translate_element"
        style={{ position: "absolute", left: "-9999px", top: "-9999px", opacity: 0, pointerEvents: "none" }}
        aria-hidden="true"
      />
    </LanguageContext.Provider>
  );
}
