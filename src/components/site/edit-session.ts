"use client";

import { useSyncExternalStore } from "react";

/**
 * Edit mode keeps changes on the page until "Guardar cambios" in the edit bar.
 * Each editable registers its pending save under a key; a newer edit of the same
 * thing replaces the older one.
 */
const pending = new Map<string, () => Promise<unknown>>();
const listeners = new Set<() => void>();
let version = 0;

function emit() {
  version++;
  listeners.forEach((l) => l());
}

export function queueEdit(key: string, save: () => Promise<unknown>) {
  pending.set(key, save);
  emit();
}

export function pendingCount() {
  return pending.size;
}

/** Runs every pending save in the order they were made. Failed ones stay pending. */
export async function saveAllEdits() {
  const entries = [...pending.entries()];
  const failed: string[] = [];
  for (const [key, save] of entries) {
    try {
      await save();
      if (pending.get(key) === save) pending.delete(key);
    } catch (error) {
      console.error("[edit] save failed", key, error);
      failed.push(key);
    }
  }
  emit();
  return failed.length;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePendingEdits() {
  useSyncExternalStore(subscribe, () => version, () => 0);
  return pending.size;
}
