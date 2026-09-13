export const PINNED_LANGUAGES = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    region: "National / Global",
    flag: "🌐",
    isTop: true,
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    region: "Andhra Pradesh & Telangana",
    flag: "🌾",
    isTop: true,
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    region: "National / North & Central India",
    flag: "🇮🇳",
    isTop: true,
  },
];

export const OTHER_LANGUAGES = [
  {
    code: "as",
    name: "Assamese",
    nativeName: "অসমীয়া",
    region: "Assam",
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    region: "West Bengal & Tripura",
  },
  {
    code: "bho",
    name: "Bhojpuri",
    nativeName: "भोजपुरी",
    region: "Bihar & Eastern UP",
  },
  {
    code: "brx",
    name: "Bodo",
    nativeName: "बड़ो",
    region: "Assam & Bodoland",
  },
  {
    code: "doi",
    name: "Dogri",
    nativeName: "डोगरी",
    region: "Jammu & Kashmir",
  },
  {
    code: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    region: "Gujarat",
  },
  {
    code: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    region: "Karnataka",
  },
  {
    code: "ks",
    name: "Kashmiri",
    nativeName: "کٲشُر",
    region: "Jammu & Kashmir",
  },
  {
    code: "gom",
    name: "Konkani",
    nativeName: "कोंकणी",
    region: "Goa & Coastal Karnataka",
  },
  {
    code: "mai",
    name: "Maithili",
    nativeName: "मैथिली",
    region: "Bihar & Jharkhand",
  },
  {
    code: "ml",
    name: "Malayalam",
    nativeName: "മലയാളം",
    region: "Kerala & Lakshadweep",
  },
  {
    code: "mni-Mtei",
    name: "Manipuri (Meitei)",
    nativeName: "মৈতৈলোন্",
    region: "Manipur",
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    region: "Maharashtra",
  },
  {
    code: "lus",
    name: "Mizo",
    nativeName: "Mizo ṭawng",
    region: "Mizoram",
  },
  {
    code: "ne",
    name: "Nepali",
    nativeName: "नेपाली",
    region: "Sikkim & West Bengal",
  },
  {
    code: "or",
    name: "Odia",
    nativeName: "ଓଡ଼ିଆ",
    region: "Odisha",
  },
  {
    code: "pa",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    region: "Punjab & Haryana",
  },
  {
    code: "sa",
    name: "Sanskrit",
    nativeName: "संस्कृतम्",
    region: "Classical Indian Language",
  },
  {
    code: "sat",
    name: "Santali",
    nativeName: "ᱥᱟᱱᱛᱟᱲᱤ",
    region: "Jharkhand, Odisha & Bengal",
  },
  {
    code: "sd",
    name: "Sindhi",
    nativeName: "سنڌي",
    region: "Sindhi Community / National",
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    region: "Tamil Nadu & Puducherry",
  },
  {
    code: "ur",
    name: "Urdu",
    nativeName: "اردو",
    region: "National / Telangana & UP",
  },
  {
    code: "kok",
    name: "Kokborok",
    nativeName: "कॉकबरॉक",
    region: "Tripura",
  },
  {
    code: "kha",
    name: "Khasi",
    nativeName: "Ka Ktien Khasi",
    region: "Meghalaya",
  },
  {
    code: "grt",
    name: "Garo",
    nativeName: "A·chik",
    region: "Meghalaya",
  },
  {
    code: "raj",
    name: "Rajasthani",
    nativeName: "राजस्थानी",
    region: "Rajasthan",
  },
];

export const ALL_LANGUAGES = [...PINNED_LANGUAGES, ...OTHER_LANGUAGES];

export const DEFAULT_LANGUAGE = PINNED_LANGUAGES[0]; // English

export function getLanguageByCode(code) {
  if (!code) return DEFAULT_LANGUAGE;
  return ALL_LANGUAGES.find((lang) => lang.code.toLowerCase() === code.toLowerCase()) || DEFAULT_LANGUAGE;
}
