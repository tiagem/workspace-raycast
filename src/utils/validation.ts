import { type Application } from "@raycast/api";

import { App } from "@/types";

export function normalizeApp(value: unknown): App | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.name !== "string") {
    return null;
  }

  // Accept both Raycast backups (`bundleId`) and Vicinae backups (`id`).
  const rawId = typeof record.id === "string" ? record.id : undefined;
  const rawBundleId = typeof record.bundleId === "string" ? record.bundleId : undefined;
  const id = rawId || rawBundleId || "";

  if (!id) {
    return null;
  }

  return {
    id,
    name: record.name,
    path: typeof record.path === "string" ? record.path : undefined,
  };
}

export function toApp(app: Application): App {
  return {
    id: app.bundleId ?? app.path,
    name: app.name,
    path: app.path,
  };
}
