// AI server timeout helper — Vite proxy's 2-minute setTimeout intent
// transplanted to call-site AbortSignal (phase-5-infra.md §1.2 option Z).

export const AI_REQUEST_TIMEOUT_MS = 120000;

export interface AiTimeoutHandle {
  signal: AbortSignal;
  clear: () => void;
}

export function createAiTimeoutSignal(
  timeoutMs: number = AI_REQUEST_TIMEOUT_MS,
): AiTimeoutHandle {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId),
  };
}
