import { SupportedLanguage, TranslateResult } from "../types/translate";

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  "zh-TW": "繁體中文",
  "zh-CN": "简体中文",
  en: "English",
  ja: "日本語",
  ko: "한국어",
};

// Detects whether text appears to be written in the given language
function isInLanguage(text: string, language: SupportedLanguage): boolean {
  switch (language) {
    case "zh-TW":
    case "zh-CN":
      return /[㐀-鿿豈-﫿]/.test(text);
    case "ja":
      // Hiragana or Katakana (CJK alone is ambiguous between ja/zh)
      return /[぀-ゟ゠-ヿ]/.test(text);
    case "ko":
      return /[가-힯]/.test(text);
    case "en":
      // Treat as English when no CJK, Hangul, kana, or Cyrillic is present
      return !/[぀-鿿가-힯豈-﫿Ѐ-ӿ]/.test(text);
  }
}

export function detectLanguageDirection(
  text: string,
  primaryLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage,
): Pick<TranslateResult, "sourceLanguage" | "targetLanguage"> {
  if (isInLanguage(text, primaryLanguage)) {
    return { sourceLanguage: primaryLanguage, targetLanguage };
  }
  return { sourceLanguage: targetLanguage, targetLanguage: primaryLanguage };
}

export function languageLabel(language: SupportedLanguage): string {
  return LANGUAGE_LABELS[language];
}

export async function translateText(
  text: string,
  primaryLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage,
): Promise<TranslateResult> {
  const direction = detectLanguageDirection(
    text,
    primaryLanguage,
    targetLanguage,
  );
  const params = new URLSearchParams({
    client: "gtx",
    sl: direction.sourceLanguage,
    tl: direction.targetLanguage,
    dt: "t",
    q: text,
  });

  const response = await fetch(
    `https://translate.googleapis.com/translate_a/single?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(`Translation failed with status ${response.status}`);
  }

  const data = (await response.json()) as unknown[];
  const sentences = Array.isArray(data[0]) ? (data[0] as unknown[]) : [];
  const translatedText = sentences
    .map((sentence) =>
      Array.isArray(sentence) && typeof sentence[0] === "string"
        ? sentence[0]
        : "",
    )
    .join("");

  if (!translatedText) {
    throw new Error("Translation service returned an empty result");
  }

  return { ...direction, translatedText };
}
