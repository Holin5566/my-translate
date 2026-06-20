import { showHUD } from "@raycast/api";

const MIN_HUD_DURATION_MS = 3000;
const HUD_REFRESH_INTERVAL_MS = 1200;

function waitForMinimumHUDDuration() {
  return new Promise<void>((resolve) =>
    setTimeout(resolve, MIN_HUD_DURATION_MS),
  );
}

export async function showHUDWhile(
  message: string,
  pending?: Promise<void>,
): Promise<void> {
  await showHUD(message);

  const refreshTimer = setInterval(() => {
    void showHUD(message);
  }, HUD_REFRESH_INTERVAL_MS);

  try {
    await Promise.all([
      waitForMinimumHUDDuration(),
      pending ?? Promise.resolve(),
    ]);
  } finally {
    clearInterval(refreshTimer);
  }
}
