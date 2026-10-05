// sticky-model: last /model selection becomes the default model,
// and each model remembers its own thinking effort.
// Install: ~/.pi/agent/extensions/sticky-model.ts (or .pi/extensions/ for a project).
// Remove/disable the file to restore stock behavior.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { ModelSelectSource, ThinkingLevel } from "@earendil-works/pi-coding-agent";

export function shouldPersistModelSelect(source: ModelSelectSource): boolean {
  // Only /model Enter ("set") counts as a manual switch.
  // Ctrl+P cycling ("cycle") and session resume ("restore") stay session-only.
  return source === "set";
}

type SettingsRecord = Record<string, unknown>;

/** Parse settings text. Returns {} for empty, null for invalid (never throws). */
function parseSettings(previousText: string | null | undefined): SettingsRecord | null {
  if (previousText === null || previousText === undefined || previousText.trim() === "") return {};
  try {
    return JSON.parse(previousText) as SettingsRecord;
  } catch {
    return null;
  }
}

function withEffort(
  settings: SettingsRecord,
  provider: string,
  modelId: string,
  thinkingLevel: ThinkingLevel,
): SettingsRecord {
  const levels = { ...((settings["modelThinkingLevels"] as SettingsRecord | undefined) ?? {}) };
  levels[`${provider}/${modelId}`] = thinkingLevel;
  return { ...settings, modelThinkingLevels: levels };
}

/** Returns null when previous settings are corrupt, so callers skip the write. */
export function applyStickyModel(
  previousText: string | null | undefined,
  provider: string,
  modelId: string,
  thinkingLevel?: ThinkingLevel,
): string | null {
  const settings = parseSettings(previousText);
  if (settings === null) return null;
  const next: SettingsRecord = { ...settings, defaultProvider: provider, defaultModel: modelId };
  return JSON.stringify(
    thinkingLevel === undefined ? next : withEffort(next, provider, modelId, thinkingLevel),
    null,
    2,
  );
}

/** Returns null when previous settings are corrupt, so callers skip the write. */
export function applyStickyEffort(
  previousText: string | null | undefined,
  provider: string,
  modelId: string,
  level: ThinkingLevel,
): string | null {
  const settings = parseSettings(previousText);
  if (settings === null) return null;
  return JSON.stringify(withEffort(settings, provider, modelId, level), null, 2);
}

export function resolveAgentDir(): string {
  return process.env.PI_CODING_AGENT_DIR ?? join(homedir(), ".pi", "agent");
}

/** Applies rewrite to settings.json. Returns false (without writing) on corrupt input. */
function updateSettings(rewrite: (previous: string | null) => string | null): boolean {
  const file = join(resolveAgentDir(), "settings.json");
  const previous = existsSync(file) ? readFileSync(file, "utf8") : null;
  const next = rewrite(previous);
  if (next === null) return false;
  writeFileSync(file, next);
  return true;
}

export default function (pi: ExtensionAPI): void {
  pi.on("model_select", (event, ctx) => {
    if (!shouldPersistModelSelect(event.source)) return;
    const saved = updateSettings((previous) =>
      applyStickyModel(previous, event.model.provider, event.model.id, ctx.thinkingLevel),
    );
    ctx.ui.notify(
      saved
        ? `Default model: ${event.model.provider}/${event.model.id}`
        : "Sticky-model: settings.json is corrupt, default not saved",
      saved ? "info" : "error",
    );
  });
  pi.on("thinking_level_select", (event, ctx) => {
    const model = ctx.model;
    if (!model) return;
    if (!updateSettings((previous) => applyStickyEffort(previous, model.provider, model.id, event.level))) {
      ctx.ui.notify("Sticky-model: settings.json is corrupt, effort not saved", "error");
    }
  });
}
