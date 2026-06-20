import { LocalStorage } from "@raycast/api";
import { useEffect, useState } from "react";

const STORAGE_KEY = "translate-history";
const MAX_HISTORY = 200;
const RECENT_HISTORY_LIMIT = 50;
const FREQUENT_HISTORY_LIMIT = 50;

export type HistoryItem = {
  id: string;
  original: string;
  translated: string;
  source: string;
  target: string;
  createdAt: number;
  lastTranslatedAt: number;
  translateCount: number;
};

async function loadHistory(): Promise<HistoryItem[]> {
  const raw = await LocalStorage.getItem<string>(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Array<
      Partial<HistoryItem> & {
        timestamp?: number;
      }
    >;

    return parsed.map((item) => {
      const fallbackTime = item.lastTranslatedAt ?? item.createdAt ?? item.timestamp ?? Date.now();
      return {
        id:
          item.id ??
          makeHistoryId(item.original ?? "", item.source ?? "", item.target ?? ""),
        original: item.original ?? "",
        translated: item.translated ?? "",
        source: item.source ?? "",
        target: item.target ?? "",
        createdAt: item.createdAt ?? item.timestamp ?? fallbackTime,
        lastTranslatedAt: fallbackTime,
        translateCount: item.translateCount ?? 1,
      };
    });
  } catch {
    return [];
  }
}

async function saveHistory(items: HistoryItem[]) {
  await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function makeHistoryId(original: string, source: string, target: string) {
  return `${original}\u0000${source}\u0000${target}`;
}

export function useTranslateHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory().then(setHistory);
  }, []);

  async function addHistory(
    item: Omit<
      HistoryItem,
      "id" | "createdAt" | "lastTranslatedAt" | "translateCount"
    >,
  ) {
    setHistory((prev) => {
      const now = Date.now();
      const id = makeHistoryId(item.original, item.source, item.target);
      const existing = prev.find((entry) => entry.id === id);
      const next: HistoryItem = existing
        ? {
            ...existing,
            translated: item.translated,
            lastTranslatedAt: now,
            translateCount: existing.translateCount + 1,
          }
        : {
            ...item,
            id,
            createdAt: now,
            lastTranslatedAt: now,
            translateCount: 1,
          };

      const updated = [next, ...prev.filter((entry) => entry.id !== id)].slice(
        0,
        MAX_HISTORY,
      );
      saveHistory(updated);
      return updated;
    });
  }

  async function removeHistory(id: string) {
    setHistory((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      saveHistory(updated);
      return updated;
    });
  }

  async function clearHistory() {
    setHistory([]);
    await LocalStorage.removeItem(STORAGE_KEY);
  }

  const recentHistory = [...history]
    .sort((a, b) => b.lastTranslatedAt - a.lastTranslatedAt)
    .slice(0, RECENT_HISTORY_LIMIT);
  const frequentHistory = [...history]
    .sort((a, b) => {
      if (b.translateCount !== a.translateCount) {
        return b.translateCount - a.translateCount;
      }
      return b.lastTranslatedAt - a.lastTranslatedAt;
    })
    .slice(0, FREQUENT_HISTORY_LIMIT);

  return {
    history,
    recentHistory,
    frequentHistory,
    addHistory,
    removeHistory,
    clearHistory,
  };
}
