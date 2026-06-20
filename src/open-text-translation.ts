import {
  LaunchType,
  getSelectedText,
  launchCommand,
  showHUD,
} from "@raycast/api";

export default async function Command() {
  try {
    const selectedText = (await getSelectedText()).trim();

    await launchCommand({
      name: "translate-text",
      type: LaunchType.UserInitiated,
      context: {
        text: selectedText,
        launchId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
    });
  } catch {
    await showHUD("No selected text found");
    await launchCommand({
      name: "translate-text",
      type: LaunchType.UserInitiated,
      context: {
        launchId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
    });
  }
}
