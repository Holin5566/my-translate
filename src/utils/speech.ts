import { spawn, ChildProcess } from "node:child_process";
import { SpeechMode, SupportedLanguage } from "../types/translate";

let activeSpeechProcess: ChildProcess | undefined;

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

function countCjkChars(text: string): number {
  const matches = text.match(/[\u3400-\u9fff\uf900-\ufaff]/g);
  return matches?.length ?? 0;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function isShortSpeakableText(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  const cjkChars = countCjkChars(trimmed);
  if (cjkChars > 0) {
    return cjkChars <= MAX_AUTO_SPEAK_CJK_CHARS;
  }

  return countWords(trimmed) <= MAX_AUTO_SPEAK_WORDS;
}

export function shouldAutoSpeak(
  text: string,
  speechMode: SpeechMode | undefined,
): boolean {
  if (speechMode === "always") return true;
  if (speechMode === "off") return false;
  return isShortSpeakableText(text);
}

function buildSpeechPayload(text: string): string | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  return `[[slnc ${LEADING_SILENCE_MS}]] ${trimmed} [[slnc ${TRAILING_SILENCE_MS}]]`;
}

export function startSpeech(text: string, language?: SupportedLanguage): Promise<void> | undefined {
  const paddedText = buildSpeechPayload(text);
  if (!paddedText) return undefined;

  activeSpeechProcess?.kill();

  const args = language ? ["-v", LANGUAGE_VOICES[language], paddedText] : [paddedText];
  const child = spawn("say", args, { stdio: "ignore" });
  activeSpeechProcess = child;

  return new Promise<void>((resolve) => {
    child.on("error", (error) => {
      console.warn("Speech playback failed", error);
      resolve();
    });
    child.on("exit", () => {
      if (activeSpeechProcess === child) activeSpeechProcess = undefined;
      resolve();
    });
  });
}

export async function speakText(text: string, language?: SupportedLanguage): Promise<void> {
  await (startSpeech(text, language) ?? Promise.resolve());
}
