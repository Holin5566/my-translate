import { spawn, ChildProcess } from "node:child_process";
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SpeechMode, SpeechRate, SupportedLanguage } from "../types/translate";

let activeAbort: AbortController | undefined;
let activeProcess: ChildProcess | undefined;

const LANGUAGE_VOICES: Record<SupportedLanguage, string> = {
  "zh-TW": "Meijia",
  "zh-CN": "Tingting",
  en: "Samantha",
  ja: "Kyoko",
  ko: "Yuna",
};

const LEADING_SILENCE_MS = 100;
const TRAILING_SILENCE_MS = 900;
const MAX_AUTO_SPEAK_WORDS = 8;
const MAX_AUTO_SPEAK_CJK_CHARS = 25;
const TTS_TEMP_FILE = join(tmpdir(), "my-translate-tts.mp3");

function countCjkChars(text: string): number {
  const matches = text.match(/[㐀-鿿豈-﫿]/g);
  return matches?.length ?? 0;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function isShortSpeakableText(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const cjkChars = countCjkChars(trimmed);
  if (cjkChars > 0) return cjkChars <= MAX_AUTO_SPEAK_CJK_CHARS;
  return countWords(trimmed) <= MAX_AUTO_SPEAK_WORDS;
}

export function shouldAutoSpeak(text: string, speechMode: SpeechMode | undefined): boolean {
  if (speechMode === "always") return true;
  if (speechMode === "off") return false;
  return isShortSpeakableText(text);
}

function buildSayPayload(text: string): string {
  return `[[slnc ${LEADING_SILENCE_MS}]] ${text} [[slnc ${TRAILING_SILENCE_MS}]]`;
}

function cancelActive() {
  activeAbort?.abort();
  activeProcess?.kill();
  activeAbort = undefined;
  activeProcess = undefined;
}

async function fetchGoogleTTS(text: string, language: SupportedLanguage, signal: AbortSignal): Promise<boolean> {
  const params = new URLSearchParams({ client: "gtx", tl: language, q: text, ie: "UTF-8" });
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_tts?${params.toString()}`,
      { signal, headers: { "User-Agent": "Mozilla/5.0" } },
    );
    if (!response.ok || signal.aborted) return false;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (signal.aborted) return false;
    await writeFile(TTS_TEMP_FILE, buffer);
    return true;
  } catch {
    return false;
  }
}

const AFPLAY_SLOW_RATE = "0.75";
const SAY_SLOW_WPM = "130";

function spawnAudio(cmd: string, args: string[]): Promise<void> {
  const child = spawn(cmd, args, { stdio: "ignore" });
  activeProcess = child;
  return new Promise<void>((resolve) => {
    child.on("error", () => resolve());
    child.on("exit", () => {
      if (activeProcess === child) activeProcess = undefined;
      resolve();
    });
  });
}

export type SpeechEngine = "google" | "say";

export function startSpeech(
  text: string,
  language?: SupportedLanguage,
  rate?: SpeechRate,
  onEngineResolved?: (engine: SpeechEngine) => void,
): Promise<void> | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;

  cancelActive();
  const abort = new AbortController();
  activeAbort = abort;
  const slow = rate === "slow";

  return (async () => {
    if (language) {
      const ok = await fetchGoogleTTS(trimmed, language, abort.signal);
      if (abort.signal.aborted) return;

      if (ok) {
        onEngineResolved?.("google");
        const afplayArgs = slow ? ["-r", AFPLAY_SLOW_RATE, TTS_TEMP_FILE] : [TTS_TEMP_FILE];
        await spawnAudio("afplay", afplayArgs);
        await unlink(TTS_TEMP_FILE).catch(() => {});
        return;
      }

      onEngineResolved?.("say");
      const sayArgs = slow
        ? ["-v", LANGUAGE_VOICES[language], "-r", SAY_SLOW_WPM, buildSayPayload(trimmed)]
        : ["-v", LANGUAGE_VOICES[language], buildSayPayload(trimmed)];
      await spawnAudio("say", sayArgs);
      return;
    }

    onEngineResolved?.("say");
    const sayArgs = slow ? ["-r", SAY_SLOW_WPM, buildSayPayload(trimmed)] : [buildSayPayload(trimmed)];
    await spawnAudio("say", sayArgs);
  })();
}

export async function speakText(text: string, language?: SupportedLanguage, rate?: SpeechRate): Promise<void> {
  await (startSpeech(text, language, rate) ?? Promise.resolve());
}
