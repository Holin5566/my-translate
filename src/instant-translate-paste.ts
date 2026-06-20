import {
  Clipboard,
  getPreferenceValues,
  getSelectedText,
  showHUD,
} from "@raycast/api";
import { TranslatePreferences } from "./types/translate";
import { showHUDWhile } from "./utils/hud";
import { shouldAutoSpeak, startSpeech, SpeechEngine } from "./utils/speech";
import {
  detectLanguageDirection,
  languageLabel,
  translateText,
} from "./utils/translate";

export default async function Command() {
  const {
    primaryLanguage,
    secondaryLanguage: targetLanguage,
    speechMode,
  } = getPreferenceValues<TranslatePreferences>();

  let text: string;
  try {
    text = (await getSelectedText()).trim();
    if (!text) {
      await showHUDWhile("No selected text found");
      return;
    }
  } catch {
    await showHUDWhile("No selected text found");
    return;
  }

  try {
    const direction = detectLanguageDirection(
      text,
      primaryLanguage,
      targetLanguage,
    );
    await showHUD(
      `${languageLabel(direction.sourceLanguage)} → ${languageLabel(direction.targetLanguage)}`,
    );
    const result = await translateText(text, primaryLanguage, targetLanguage);
    await Clipboard.paste(result.translatedText);
    let hudLabel = result.translatedText;
    const speechPromise = shouldAutoSpeak(result.translatedText, speechMode)
      ? startSpeech(result.translatedText, result.targetLanguage, undefined, (engine: SpeechEngine) => {
          hudLabel = `${result.translatedText} · ${engine === "google" ? "Google TTS" : "macOS"}`;
        })
      : undefined;
    await showHUDWhile(() => hudLabel, speechPromise);
  } catch {
    await showHUDWhile("Translation failed");
  }
}
