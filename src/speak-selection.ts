import { getSelectedText } from "@raycast/api";
import { showHUDWhile } from "./utils/hud";
import { startSpeech } from "./utils/speech";

export default async function Command() {
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

  const speechPromise = startSpeech(text);
  await showHUDWhile("Speaking…", speechPromise);
}
