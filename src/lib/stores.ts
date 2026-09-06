import { get, writable } from 'svelte/store';
import type { DataWithDiagnostics, Profile } from './types';

const LOCAL_PROFILE_KEY = 'observable:localProfile';

export const notification = writable('');

function readStoredProfile(): DataWithDiagnostics | Profile | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(LOCAL_PROFILE_KEY);
    return raw ? (JSON.parse(raw) as DataWithDiagnostics | Profile) : null;
  } catch {
    return null;
  }
}

export const localData = writable<DataWithDiagnostics | Profile | null>(readStoredProfile());

localData.subscribe((value) => {
  if (typeof sessionStorage === 'undefined') return;
  try {
    if (value == null) {
      sessionStorage.removeItem(LOCAL_PROFILE_KEY);
      return;
    }
    sessionStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(value));
  } catch {
    // Very large profiles may not fit in sessionStorage; keep them in memory.
  }
});

export function getLocalProfile(): DataWithDiagnostics | Profile | null {
  return get(localData) ?? readStoredProfile();
}
