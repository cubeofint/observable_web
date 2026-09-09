import { getLocalProfile } from '$lib/stores';
import type { DataWithDiagnostics, Entry, Profile } from '../../../lib/types';
import { normalizeEntry } from '$lib/utils';
import { error } from '@sveltejs/kit';

export const ssr = false;

function normalizeDimMap(map: Record<string, unknown[]> | undefined): Record<string, Entry[]> {
  const out: Record<string, Entry[]> = {};
  for (const [dim, list] of Object.entries(map ?? {})) {
    out[dim] = (list ?? []).map((item) => normalizeEntry(item as Record<string, unknown>));
  }
  return out;
}

const getEntries = (profile: Profile) => {
  if (!profile) return [];
  let entityMap = new Map(Object.entries(profile.entities ?? {}));
  let blockMap = profile.blocks ?? {};
  let globalTicks = profile.ticks || 1;
  let dims = new Set([...Object.keys(blockMap), ...Object.keys(profile.entities ?? {})]);
  let result: {
    name: string;
    rate: number;
    entries: Entry[];
  }[] = [];

  for (let name of dims) {
    let combined = [...(entityMap.get(name) ?? []), ...(blockMap[name] ?? [])].map((e) => ({
      ...e
    }));
    let rate = 0;
    for (let e of combined) {
      // Normalize rate against the full profile tick window
      e.rate *= e.ticks / globalTicks;
      rate += e.rate;
    }
    combined.sort((a, b) => b.rate - a.rate);
    result.push({
      name,
      rate,
      entries: combined
    });
  }
  return result.sort((a, b) => b.rate - a.rate);
};

export async function load({ params, fetch }) {
  let data: DataWithDiagnostics;
  if (!params.id) {
    const local = getLocalProfile();
    if (!local) error(404, 'No data');
    if ('data' in local) {
      data = local;
    } else {
      // localData just contains profile
      data = { data: local as Profile };
    }
  } else {
    const res = await fetch(`/v1/get/${params.id}`);
    data = await res.json();
  }
  console.log(data);
  let { data: profile, diagnostics } = data;
  profile = {
    ...profile,
    entities: normalizeDimMap(profile.entities as unknown as Record<string, unknown[]>),
    blocks: normalizeDimMap(profile.blocks as unknown as Record<string, unknown[]>)
  };
  return {
    profile,
    diagnostics,
    entries: getEntries(profile)
  };
}
