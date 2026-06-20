/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Primary Language - Your main language. Text not in this language will be translated into it. */
  "primaryLanguage": "zh-TW" | "zh-CN" | "en" | "ja" | "ko",
  /** Secondary Language - Translate primary language text into this language, and vice versa. */
  "secondaryLanguage": "en" | "zh-TW" | "zh-CN" | "ja" | "ko",
  /** Speech Mode - Choose when translated text should be spoken automatically. */
  "speechMode": "off" | "short-only" | "always"
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `instant-translate-copy` command */
  export type InstantTranslateCopy = ExtensionPreferences & {}
  /** Preferences accessible in the `instant-translate-paste` command */
  export type InstantTranslatePaste = ExtensionPreferences & {}
  /** Preferences accessible in the `instant-translate-view` command */
  export type InstantTranslateView = ExtensionPreferences & {}
  /** Preferences accessible in the `open-text-translation` command */
  export type OpenTextTranslation = ExtensionPreferences & {}
  /** Preferences accessible in the `translate-text` command */
  export type TranslateText = ExtensionPreferences & {}
  /** Preferences accessible in the `speak-selection` command */
  export type SpeakSelection = ExtensionPreferences & {}
  /** Preferences accessible in the `recent-vocabulary` command */
  export type RecentVocabulary = ExtensionPreferences & {}
  /** Preferences accessible in the `frequent-vocabulary` command */
  export type FrequentVocabulary = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `instant-translate-copy` command */
  export type InstantTranslateCopy = {}
  /** Arguments passed to the `instant-translate-paste` command */
  export type InstantTranslatePaste = {}
  /** Arguments passed to the `instant-translate-view` command */
  export type InstantTranslateView = {}
  /** Arguments passed to the `open-text-translation` command */
  export type OpenTextTranslation = {}
  /** Arguments passed to the `translate-text` command */
  export type TranslateText = {
  /** Optional text to translate */
  "text": string
}
  /** Arguments passed to the `speak-selection` command */
  export type SpeakSelection = {}
  /** Arguments passed to the `recent-vocabulary` command */
  export type RecentVocabulary = {}
  /** Arguments passed to the `frequent-vocabulary` command */
  export type FrequentVocabulary = {}
}

