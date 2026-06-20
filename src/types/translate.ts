export type TranslateArguments = {
  text?: string;
};

export type TranslateLaunchContext = {
  text?: string;
  launchId?: string;
};

export type SupportedLanguage = "zh-TW" | "zh-CN" | "en" | "ja" | "ko";
export type SpeechMode = "off" | "short-only" | "always";

export type TranslateResult = {
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  translatedText: string;
};

export type LanguageDirection = {
  source: string;
  target: string;
};

export type TranslatePreferences = {
  primaryLanguage: SupportedLanguage;
  secondaryLanguage: SupportedLanguage;
  speechMode?: SpeechMode;
};
