import { notification } from './stores';
import type { Entry, Position, Trace } from './types';

export function copyTPCommand(dimension: string, entry: number | Position) {
  let cmd = `/observable tp ${dimension} `;
  if (typeof entry === 'number') {
    cmd += `entity ${entry}`;
  } else {
    let { x, y, z } = entry;
    cmd += `position ${x} ${y} ${z}`;
  }
  window.navigator.clipboard.writeText(cmd);
  notification.set(`Copied <code>${cmd}</code> to clipboard`);
}

export function download(filename: string, data: string) {
  let a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([data], { type: 'text/plain' }));
  a.download = filename;
  a.click();
}

export function formatMicrosPerTick(rate: number): string {
  return `${Math.round(rate / 1000)} μs/t`;
}

export function formatMicros(duration: number): string {
  return `${Math.round(duration / 1000)} μs`;
}

export function hasEntryTraces(entry: Entry | null | undefined): boolean {
  const traces = entry?.traces;
  if (!traces) return false;
  if (traces.children?.length) return true;
  return Boolean(traces.count > 0 && traces.className && traces.className !== 'null');
}

function mergeTraceNode(target: Trace, source: Trace) {
  target.count += source.count;
  for (const child of source.children ?? []) {
    const key = `${child.className}:${child.methodName}`;
    let existing = target.children.find((c) => `${c.className}:${c.methodName}` === key);
    if (!existing) {
      existing = {
        className: child.className,
        methodName: child.methodName,
        count: 0,
        children: []
      };
      target.children.push(existing);
    }
    mergeTraceNode(existing, child);
  }
  target.children.sort((a, b) => b.count - a.count);
}

/** Merge several per-entity traces into one tree for Aggregate drill-down. */
export function mergeTraces(traces: Trace[]): Trace | null {
  const usable = traces.filter(
    (t) => t && (t.children?.length || (t.count > 0 && t.className && t.className !== 'null'))
  );
  if (usable.length === 0) return null;
  if (usable.length === 1) return structuredClone(usable[0]);

  const first = usable[0];
  const sameRoot = usable.every(
    (t) => t.className === first.className && t.methodName === first.methodName
  );

  if (sameRoot) {
    const root: Trace = {
      className: first.className,
      methodName: first.methodName,
      count: 0,
      children: []
    };
    for (const t of usable) mergeTraceNode(root, t);
    return root;
  }

  const root: Trace = {
    className: 'aggregated',
    methodName: 'traces',
    count: 0,
    children: []
  };
  for (const t of usable) {
    const key = `${t.className}:${t.methodName}`;
    let existing = root.children.find((c) => `${c.className}:${c.methodName}` === key);
    if (!existing) {
      existing = {
        className: t.className,
        methodName: t.methodName,
        count: 0,
        children: []
      };
      root.children.push(existing);
    }
    mergeTraceNode(existing, t);
  }
  root.count = root.children.reduce((sum, c) => sum + c.count, 0);
  root.children.sort((a, b) => b.count - a.count);
  return root;
}

/** Normalize Entry shapes from older (entityId/position) and newer (obj) Observable profiles. */
export function normalizeEntry(raw: Record<string, unknown>): Entry {
  const type = String(raw.type ?? 'unknown');
  const rate = Number(raw.rate ?? 0);
  const ticks = Number(raw.ticks ?? 0);
  const traces = raw.traces as Trace | undefined;

  if (raw.position && typeof raw.position === 'object') {
    const position = raw.position as Position;
    const entityId =
      typeof raw.entityId === 'number'
        ? raw.entityId
        : typeof raw.obj === 'number'
          ? raw.obj
          : undefined;
    return { entityId, position, type, rate, ticks, traces };
  }

  if (raw.obj && typeof raw.obj === 'object') {
    const obj = raw.obj as Position;
    return {
      position: { x: obj.x, y: obj.y, z: obj.z },
      type,
      rate,
      ticks,
      traces
    };
  }

  if (typeof raw.obj === 'number') {
    return {
      entityId: raw.obj,
      position: { x: 0, y: 0, z: 0 },
      type,
      rate,
      ticks,
      traces
    };
  }

  return {
    entityId: typeof raw.entityId === 'number' ? raw.entityId : undefined,
    position: { x: 0, y: 0, z: 0 },
    type,
    rate,
    ticks,
    traces
  };
}
