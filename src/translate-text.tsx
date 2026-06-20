import {
  Action,
  ActionPanel,
  Clipboard,
  Detail,
  Icon,
  LaunchProps,
  List,
  Toast,
  showToast,
} from "@raycast/api";
import { useSmartTranslate } from "./hooks/useSmartTranslate";
import { TranslateArguments, TranslateLaunchContext } from "./types/translate";

export default function Command(
  props: LaunchProps<{
    arguments: TranslateArguments;
    launchContext?: TranslateLaunchContext;
  }>,
) {
  const incomingText =
    props.launchContext?.text?.trim() ?? props.arguments.text?.trim() ?? "";
  const launchId = props.launchContext?.launchId ?? incomingText;

  const {
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
    clearHistory,
    speakTranslated,
    speechSkippedForLength,
  } = useSmartTranslate({ incomingText, launchId });

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

  const markdown = translated
    ? [
        "# Translation",
        direction ? `**${direction.source} -> ${direction.target}**` : "",
        translated,
        speechSkippedForLength
          ? "_Auto speech skipped for long text. Use Play Translation to listen manually._"
          : "",
        "",
        "---",
        "## Original",
        searchText.trim(),
      ]
        .filter(Boolean)
        .join("\n\n")
    : error
      ? `# Translation Error\n\n${error}`
      : [
          "# Text Translation",
          selectionUnavailable
            ? "Couldn't read selected text from the frontmost app. You can still type or paste text here."
            : "Type text or launch the command with selected text.",
        ].join("\n\n");

  const mainActions = (
    <ActionPanel>
      <Action.CopyToClipboard content={translated} title="Copy Translation" />
      <Action
        title="Play Translation"
        icon={Icon.SpeakerOn}
        onAction={speakTranslated}
      />
      <Action
        title="Copy Original"
        onAction={() => handleCopy(searchText.trim(), "Original text")}
      />
      <Action
        title="Clear Input"
        onAction={clearInput}
        shortcut={{ modifiers: ["cmd"], key: "backspace" }}
      />
      <Action.Push
        title="Open Translation Detail"
        target={
          <Detail
            markdown={markdown}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard
                  content={translated}
                  title="Copy Translation"
                />
                <Action
                  title="Play Translation"
                  icon={Icon.SpeakerOn}
                  onAction={speakTranslated}
                />
                <Action
                  title="Copy Original"
                  onAction={() =>
                    handleCopy(searchText.trim(), "Original text")
                  }
                />
                <Action
                  title="Clear Input"
                  onAction={clearInput}
                  shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                />
              </ActionPanel>
            }
          />
        }
      />
      {history.length > 0 && (
        <Action
          title="Clear All History"
          icon={Icon.Trash}
          style={Action.Style.Destructive}
          onAction={clearHistory}
          shortcut={{ modifiers: ["cmd", "shift"], key: "backspace" }}
        />
      )}
    </ActionPanel>
  );

  return (
    <List
      isLoading={!ready || isLoading}
      isShowingDetail
      searchBarPlaceholder="Type English or Chinese, or launch with selected text"
      searchText={searchText}
      onSearchTextChange={handleSearchTextChange}
      throttle
    >
      <List.Section title="Translation">
        <List.Item
          title={translated || error || "Waiting for input"}
          subtitle={
            direction
              ? `${direction.source} -> ${direction.target}`
              : "Auto-detect direction"
          }
          icon={translated ? Icon.Globe : Icon.Text}
          detail={<List.Item.Detail markdown={markdown} />}
          actions={mainActions}
        />
      </List.Section>
    </List>
  );
}
