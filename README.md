# Smart Translate

A Raycast extension that:

- opens with a hotkey in Raycast
- preloads selected text when available
- accepts manual input
- auto-detects Chinese to English or English to Chinese
- shows the translation result and lets you copy it

## Commands

- `Smart Translate`: translate selected text or typed text

## Notes

- The command attempts to read the current selection with `getSelectedText()`
- If no selection is available, you can type directly into the text area
- Translation uses a public Google Translate endpoint
