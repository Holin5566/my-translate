# My Translate

A Raycast extension for fast translation between your primary and secondary language, with vocabulary tracking for language learning.

## Commands

| Command | Recommended Hotkey | Description |
|---|---|---|
| **Instant Translate Copy** | `⇧⌘C` | Translate selected text and copy the result to clipboard |
| **Instant Translate Paste** | `⇧⌘V` | Translate selected text and paste the result in place |
| **Instant Translate View** | `⇧⌘X` | Translate selected text and show the result as a HUD overlay |
| **Speak Selection** | `⇧⌘Z` | Read the highlighted text aloud in the secondary language |
| **Open Text Translation** | — | Capture the current selection and open the Text Translation view |
| **Text Translation** | — | Translate selected text or manual input with full UI |
| **Recent Vocabulary** | — | Review the words and phrases you translated most recently |
| **Frequent Vocabulary** | — | Review the words and phrases you translate most often |

The four hotkey commands are designed to work together while reading:

- Highlight a word → `⇧⌘X` to see the translation as a HUD (non-disruptive)
- Highlight a word → `⇧⌘Z` to hear it spoken in your target language
- Highlight a word → `⇧⌘C` to copy the translation and paste it elsewhere
- Highlight a word → `⇧⌘V` to replace it in place with the translation

## Features

- **Auto language detection** — detects whether input is in your primary or secondary language and translates in the right direction automatically, no manual toggle needed
- **Selection preload** — opens with the currently selected text already filled in
- **Vocabulary tracking** — every translation is saved; browse by recency or frequency for language learning review
- **Speech** — automatically speaks the translated result using the correct voice for the target language (configurable)

## Preferences

| Preference | Default | Description |
|---|---|---|
| **Primary Language** | 繁體中文 | Your main language. Text in this language is translated into the secondary language, and vice versa. |
| **Secondary Language** | English | The language to translate to/from. |
| **Speech Mode** | Short Only | When to speak the translated result: `Off`, `Short Only` (≤ 8 words / 25 CJK chars), or `Always` |

Supported languages: 繁體中文, 简体中文, English, 日本語, 한국어.

## Notes

- Translation uses a public Google Translate endpoint (`translate.googleapis.com`)
- Speech uses macOS `say` with a voice matched to the target language
