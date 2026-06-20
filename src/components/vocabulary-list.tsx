import { Action, ActionPanel, Clipboard, Icon, List, Toast, showToast } from "@raycast/api";
import { HistoryItem, useTranslateHistory } from "../hooks/useTranslateHistory";

type VocabularyMode = "recent" | "frequent";

type VocabularyListProps = {
  mode: VocabularyMode;
};

function getSectionTitle(mode: VocabularyMode) {
  return mode === "recent" ? "Recent" : "Frequent";
}

function getEmptyTitle(mode: VocabularyMode) {
  return mode === "recent" ? "No Recent Translations" : "No Frequent Translations";
}

function getEmptyDescription(mode: VocabularyMode) {
  return mode === "recent"
    ? "Translate a few words first and they will appear here."
    : "Repeated translations will build your frequent word list here.";
}

function getMarkdownTitle(mode: VocabularyMode) {
  return mode === "recent" ? "# Recent Translation" : "# Frequent Translation";
}

function buildItemMarkdown(item: HistoryItem, mode: VocabularyMode) {
  return [
    getMarkdownTitle(mode),
    `**${item.source} -> ${item.target}**`,
    `Translated ${item.translateCount} times`,
    "",
    item.translated,
    "",
    "---",
    "## Original",
    item.original,
  ].join("\n\n");
}

export function VocabularyList({ mode }: VocabularyListProps) {
  const { recentHistory, frequentHistory, removeHistory, clearHistory } = useTranslateHistory();
  const items = mode === "recent" ? recentHistory : frequentHistory;

  async function handleCopy(value: string, label: string) {
    if (!value.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: `No ${label.toLowerCase()} to copy`,
      });
      return;
    }

    await Clipboard.copy(value);
    await showToast({ style: Toast.Style.Success, title: `${label} copied` });
  }

  return (
    <List isShowingDetail searchBarPlaceholder={`Search ${getSectionTitle(mode).toLowerCase()} vocabulary`}>
      {items.length > 0 ? (
        <List.Section title={getSectionTitle(mode)}>
          {items.map((item) => (
            <List.Item
              key={item.id}
              title={item.original}
              subtitle={item.translated}
              accessories={
                mode === "recent"
                  ? [{ text: `${item.source} → ${item.target}` }, { text: `${item.translateCount}x` }]
                  : [{ text: `${item.translateCount}x` }, { text: `${item.source} → ${item.target}` }]
              }
              icon={mode === "recent" ? Icon.Clock : Icon.BarChart}
              detail={<List.Item.Detail markdown={buildItemMarkdown(item, mode)} />}
              actions={
                <ActionPanel>
                  <Action.CopyToClipboard content={item.translated} title="Copy Translation" />
                  <Action
                    title="Copy Original"
                    onAction={() => handleCopy(item.original, "Original text")}
                  />
                  <Action
                    title="Remove from Vocabulary"
                    icon={Icon.Trash}
                    style={Action.Style.Destructive}
                    onAction={() => removeHistory(item.id)}
                    shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                  />
                  <Action
                    title="Clear All Vocabulary"
                    icon={Icon.Trash}
                    style={Action.Style.Destructive}
                    onAction={clearHistory}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "backspace" }}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      ) : (
        <List.EmptyView
          icon={mode === "recent" ? Icon.Clock : Icon.BarChart}
          title={getEmptyTitle(mode)}
          description={getEmptyDescription(mode)}
        />
      )}
    </List>
  );
}
