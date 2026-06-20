import { LocalStorage } from "@raycast/api";
import { useEffect, useState } from "react";

const STORAGE_KEY = "translate-history";
const MAX_HISTORY = 50;

export type HistoryItem = {
  id: string;
  original: string;
  translated: string;
  source: string;
  target: string;
  timestamp: number;
};

async function loadHistory(): Promise<HistoryItem[]> {
  const raw = await LocalStorage.getItem<string>(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as HistoryItem[];
  } catch {
    return [];
  }
}

async function saveHistory(items: HistoryItem[]) {
  await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useTranslateHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory().then(setHistory);
  }, []);

  async function addHistory(item: Omit<HistoryItem, "id" | "timestamp">) {
    const next: HistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      // 去重：移除相同原文的舊紀錄
      const deduped = prev.filter((h) => h.original !== item.original);
      const updated = [next, ...deduped].slice(0, MAX_HISTORY);
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

  return { history, addHistory, removeHistory, clearHistory };
}
