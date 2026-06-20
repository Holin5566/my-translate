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
  /** Preferences accessible in the `translate-selected-text` command */
  export type TranslateSelectedText = ExtensionPreferences & {}
  /** Preferences accessible in the `smart-translate` command */
  export type SmartTranslate = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `instant-translate-copy` command */
  export type InstantTranslateCopy = {}
  /** Arguments passed to the `instant-translate-paste` command */
  export type InstantTranslatePaste = {}
  /** Arguments passed to the `instant-translate-view` command */
  export type InstantTranslateView = {}
  /** Arguments passed to the `translate-selected-text` command */
  export type TranslateSelectedText = {}
  /** Arguments passed to the `smart-translate` command */
  export type SmartTranslate = {
  /** Optional text to translate */
  "text": string
}
}

