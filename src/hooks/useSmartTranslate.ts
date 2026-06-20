import { getPreferenceValues, getSelectedText } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { LanguageDirection, SupportedLanguage, TranslatePreferences } from "../types/translate";
import { shouldAutoSpeak, speakText } from "../utils/speech";
import { languageLabel, translateText } from "../utils/translate";
import { useTranslateHistory } from "./useTranslateHistory";

type UseSmartTranslateOptions = {
  incomingText: string;
  launchId: string;
};

type UseSmartTranslateReturn = {
  searchText: string;
  translated: string;
  isLoading: boolean;
  error: string | undefined;
  selectionUnavailable: boolean;
  direction: LanguageDirection | undefined;
  ready: boolean;
  handleSearchTextChange: (text: string) => void;
  clearInput: () => void;
  history: ReturnType<typeof useTranslateHistory>["history"];
  recentHistory: ReturnType<typeof useTranslateHistory>["recentHistory"];
  frequentHistory: ReturnType<typeof useTranslateHistory>["frequentHistory"];
  removeHistory: ReturnType<typeof useTranslateHistory>["removeHistory"];
  clearHistory: ReturnType<typeof useTranslateHistory>["clearHistory"];
  fillFromHistory: (original: string) => void;
  speakTranslated: () => Promise<void>;
  speechSkippedForLength: boolean;
};

export function useSmartTranslate({
  incomingText,
  launchId,
}: UseSmartTranslateOptions): UseSmartTranslateReturn {
  const {
    primaryLanguage,
    secondaryLanguage: targetLanguage,
    speechMode,
  } = getPreferenceValues<TranslatePreferences>();
  const {
    history,
    recentHistory,
    frequentHistory,
    addHistory,
    removeHistory,
    clearHistory,
  } = useTranslateHistory();

  const [searchText, setSearchText] = useState(incomingText);
  const [translated, setTranslated] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(incomingText));
  const [error, setError] = useState<string>();
  const [selectionUnavailable, setSelectionUnavailable] = useState(false);
  const [direction, setDirection] = useState<LanguageDirection>();
  const [translatedLanguage, setTranslatedLanguage] = useState<SupportedLanguage>();
  const [ready, setReady] = useState(Boolean(incomingText));
  const [speechSkippedForLength, setSpeechSkippedForLength] = useState(false);

  const requestIdRef = useRef(0);
  const lastAutoFilledTextRef = useRef(incomingText);
  const userEditedTextRef = useRef(false);

  function applyIncomingText(nextText: string) {
    const trimmed = nextText.trim();
    const shouldReplace =
      !userEditedTextRef.current ||
      searchText.trim() === "" ||
      searchText.trim() === lastAutoFilledTextRef.current;

    lastAutoFilledTextRef.current = trimmed;

    if (shouldReplace) {
      userEditedTextRef.current = false;
      setSearchText(trimmed);
    }
  }

  function handleSearchTextChange(nextText: string) {
    userEditedTextRef.current = true;
    setSearchText(nextText);
  }

  function clearInput() {
    userEditedTextRef.current = false;
    lastAutoFilledTextRef.current = "";
    setSearchText("");
    setSelectionUnavailable(false);
  }

  function fillFromHistory(original: string) {
    userEditedTextRef.current = true;
    setSearchText(original);
  }

  async function speakTranslated() {
    await speakText(translated, translatedLanguage);
  }

  useEffect(() => {
    userEditedTextRef.current = false;
    setTranslated("");
    setDirection(undefined);
    setTranslatedLanguage(undefined);
    setError(undefined);
    setSpeechSkippedForLength(false);

    if (incomingText) {
      applyIncomingText(incomingText);
      setSelectionUnavailable(false);
      setReady(true);
      return;
    }

    let active = true;

    async function preloadSelectedText() {
      try {
        const selectedText = (await getSelectedText()).trim();

        if (active && selectedText) {
          applyIncomingText(selectedText);
          setSelectionUnavailable(false);
        } else if (active) {
          lastAutoFilledTextRef.current = "";
        }
      } catch {
        if (active) setSelectionUnavailable(true);
      } finally {
        if (active) setReady(true);
      }
    }

    preloadSelectedText();

    return () => {
      active = false;
    };
  }, [incomingText, launchId]);

  useEffect(() => {
    if (!ready) return;

    const trimmed = searchText.trim();
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    if (!trimmed) {
      setTranslated("");
      setDirection(undefined);
      setTranslatedLanguage(undefined);
      setError(undefined);
      setIsLoading(false);
      setSpeechSkippedForLength(false);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    const timeout = setTimeout(async () => {
      try {
        const result = await translateText(
          trimmed,
          primaryLanguage,
          targetLanguage,
        );

        if (requestId !== requestIdRef.current) return;

        const dir = {
          source: languageLabel(result.sourceLanguage),
          target: languageLabel(result.targetLanguage),
        };
        setTranslated(result.translatedText);
        setDirection(dir);
        setTranslatedLanguage(result.targetLanguage);
        const shouldSpeak = shouldAutoSpeak(result.translatedText, speechMode);
        setSpeechSkippedForLength(speechMode === "short-only" && !shouldSpeak);
        addHistory({
          original: trimmed,
          translated: result.translatedText,
          ...dir,
        });
        if (shouldSpeak) {
          void speakText(result.translatedText, result.targetLanguage);
        }
      } catch (translationError) {
        if (requestId !== requestIdRef.current) return;

        setTranslated("");
        setDirection(undefined);
        setTranslatedLanguage(undefined);
        setSpeechSkippedForLength(false);
        setError(
          translationError instanceof Error
            ? translationError.message
            : "Unknown translation error",
        );
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [ready, searchText, primaryLanguage, speechMode, targetLanguage]);

  return {
    searchText,
    translated,
    isLoading,
    error,
    selectionUnavailable,
    direction,
    ready,
    handleSearchTextChange,
    clearInput,
    history,
    recentHistory,
    frequentHistory,
    removeHistory,
    clearHistory,
    fillFromHistory,
    speakTranslated,
    speechSkippedForLength,
  };
}
