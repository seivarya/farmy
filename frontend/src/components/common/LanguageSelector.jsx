import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDownIcon, GlobeIcon } from "./Icons";
import { useLanguage } from "../../hooks/useLanguage";
import { PINNED_LANGUAGES, OTHER_LANGUAGES } from "../../data/languages";
import "./LanguageSelector.css";

function LanguageSelector({ variant = "dark", className = "" }) {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      // Auto-focus search input when opened
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        setSearchQuery("");
      }
      return !prev;
    });
  }, []);

  const handleSelectLanguage = useCallback(
    (code) => {
      changeLanguage(code);
      setIsOpen(false);
    },
    [changeLanguage]
  );

  const query = searchQuery.trim().toLowerCase();

  const filteredPinned = useMemo(() => {
    if (!query) return PINNED_LANGUAGES;
    return PINNED_LANGUAGES.filter(
      (lang) =>
        lang.name.toLowerCase().includes(query) ||
        lang.nativeName.toLowerCase().includes(query) ||
        lang.code.toLowerCase().includes(query) ||
        (lang.region && lang.region.toLowerCase().includes(query))
    );
  }, [query]);

  const filteredOther = useMemo(() => {
    if (!query) return OTHER_LANGUAGES;
    return OTHER_LANGUAGES.filter(
      (lang) =>
        lang.name.toLowerCase().includes(query) ||
        lang.nativeName.toLowerCase().includes(query) ||
        lang.code.toLowerCase().includes(query) ||
        (lang.region && lang.region.toLowerCase().includes(query))
    );
  }, [query]);

  const totalResults = filteredPinned.length + filteredOther.length;

  return (
    <div
      ref={dropdownRef}
      className={`language-selector-wrapper variant-${variant} ${className} notranslate`}
      translate="no"
    >
      <button
        type="button"
        className="language-selector-trigger"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select language. Current language is ${currentLanguage.name}`}
      >
        <GlobeIcon size={15} />
        <div className="lang-text-group">
          <small className="lang-sub-label">PORTAL LANGUAGE</small>
          <strong className="lang-main-label">
            {currentLanguage.nativeName}
            {currentLanguage.code !== "en" && currentLanguage.code !== currentLanguage.nativeName && (
              <span className="lang-native-inline">({currentLanguage.name})</span>
            )}
          </strong>
        </div>
        <span className={`lang-chevron ${isOpen ? "open" : ""}`}>
          <ChevronDownIcon size={13} />
        </span>
      </button>

      {isOpen && (
        <div className="language-dropdown-menu" role="listbox">
          {/* Search Box */}
          <div className="lang-search-box">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search language / భాష..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search languages"
            />
            {searchQuery && (
              <button
                type="button"
                className="lang-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="lang-list-scroll">
            {/* Top Pinned Languages (English, Telugu, Hindi) */}
            {filteredPinned.length > 0 && (
              <div className="lang-section">
                <div className="lang-section-title">
                  <span>TOP PRIORITY LANGUAGES</span>
                  <span className="lang-priority-badge">MAIN</span>
                </div>
                {filteredPinned.map((lang) => {
                  const isActive = currentLanguage.code === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      className={`lang-item-btn ${isActive ? "active" : ""}`}
                      onClick={() => handleSelectLanguage(lang.code)}
                      role="option"
                      aria-selected={isActive}
                    >
                      <div className="lang-item-left">
                        <span className="lang-item-flag">{lang.flag || "🌾"}</span>
                        <div className="lang-item-texts">
                          <span className="lang-item-native">{lang.nativeName}</span>
                          <span className="lang-item-sub">{lang.name}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span className="lang-item-region">{lang.region}</span>
                        {isActive && <span className="lang-active-check">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Other Indian Regional Languages */}
            {filteredOther.length > 0 && (
              <div className="lang-section">
                <div className="lang-section-title">
                  <span>ALL REGIONAL LANGUAGES</span>
                  <span className="lang-priority-badge">{OTHER_LANGUAGES.length}</span>
                </div>
                {filteredOther.map((lang) => {
                  const isActive = currentLanguage.code === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      className={`lang-item-btn ${isActive ? "active" : ""}`}
                      onClick={() => handleSelectLanguage(lang.code)}
                      role="option"
                      aria-selected={isActive}
                    >
                      <div className="lang-item-left">
                        <span className="lang-item-flag">🇮🇳</span>
                        <div className="lang-item-texts">
                          <span className="lang-item-native">{lang.nativeName}</span>
                          <span className="lang-item-sub">{lang.name}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span className="lang-item-region">{lang.region}</span>
                        {isActive && <span className="lang-active-check">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {totalResults === 0 && (
              <div className="lang-no-results">
                No Indian languages matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(LanguageSelector);
