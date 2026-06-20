import { getPreferenceValues, getSelectedText } from "@raycast/api";
import { TranslatePreferences } from "./types/translate";
import { showHUDWhile } from "./utils/hud";
import { SpeechEngine, startSpeech } from "./utils/speech";
import { detectLanguageDirection } from "./utils/translate";

export default async function Command() {
  const { primaryLanguage, secondaryLanguage, speakSelectionRate } = getPreferenceValues<TranslatePreferences>();

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

  const { sourceLanguage } = detectLanguageDirection(text, primaryLanguage, secondaryLanguage);

  let hudLabel = speakSelectionRate === "slow" ? "Speaking (Slow)…" : "Speaking…";

  function onEngineResolved(engine: SpeechEngine) {
    const engineTag = engine === "google" ? "Google TTS" : "macOS";
    const rateTag = speakSelectionRate === "slow" ? " · Slow" : "";
    hudLabel = `Speaking · ${engineTag}${rateTag}`;
  }

  const speechPromise = startSpeech(text, sourceLanguage, speakSelectionRate, onEngineResolved);
  await showHUDWhile(() => hudLabel, speechPromise);
}
