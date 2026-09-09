<script lang="ts">
  import Trace from '$lib/Trace.svelte';
  import type { Entry, Trace as TraceTree } from '$lib/types';
  import { formatMicros, hasEntryTraces, mergeTraces } from '$lib/utils';
  import type { PageData } from './$types';

  export let data: PageData;

  let expanded = new Set<string>();

  function getAggregateData(profile: PageData['profile']) {
    let entries = [
      ...(Object.values(profile.blocks ?? {}).flat() as Entry[]),
      ...(Object.values(profile.entities ?? {}).flat() as Entry[])
    ];
    let aggregateMap: Map<
      string,
      { duration: number; count: number; traces: TraceTree | null }
    > = new Map();
    for (const e of entries) {
      let val = aggregateMap.get(e.type) ?? { duration: 0, count: 0, traces: null };
      val.duration += e.rate * e.ticks;
      val.count++;
      aggregateMap.set(e.type, val);
    }

    for (const [type, val] of aggregateMap) {
      const typeTraces = entries
        .filter((e) => e.type === type && hasEntryTraces(e))
        .map((e) => e.traces!) as TraceTree[];
      val.traces = mergeTraces(typeTraces);
    }

    return Array.from(aggregateMap.entries()).sort(([_1, a], [_2, b]) => {
      return b.duration - a.duration;
    });
  }

  $: aggregates = getAggregateData(data.profile);
  $: total = aggregates.reduce((acc, [, { duration }]) => acc + duration, 0);

  function toggle(name: string) {
    if (expanded.has(name)) expanded.delete(name);
    else expanded.add(name);
    expanded = expanded;
  }
</script>

<div class="panel overflow-x-auto">
  <table class="data-table">
    <thead>
      <tr class="text-left text-xs uppercase tracking-wide text-zinc-400">
        <td>Name</td>
        <td>Time spent</td>
      </tr>
    </thead>
    <tbody>
      {#each aggregates as [name, { duration, count, traces }]}
        {@const open = expanded.has(name)}
        {@const expandable = Boolean(traces)}
        <tr class="hover:bg-ink-800/70" class:bg-ink-800={open}>
          <td>
            {#if expandable}
              <button
                type="button"
                class="inline-flex items-center gap-1 text-left font-medium hover:text-sky-300"
                on:click={() => toggle(name)}
              >
                <span class="w-3 text-zinc-400">{open ? '−' : '+'}</span>
                {name}
              </button>
            {:else}
              <span class="font-medium">{name}</span>
            {/if}
            <span class="ml-2 text-zinc-400">×{count}</span>
          </td>
          <td class="font-mono">
            <div class="flex items-center gap-3">
              <div class="rate-bar w-28">
                <span style="width: {total ? (100 * duration) / total : 0}%"></span>
              </div>
              {formatMicros(duration)}
              <span class="text-zinc-400"
                >({total ? ((100 * duration) / total).toFixed(1) : '0.0'}%)</span
              >
            </div>
          </td>
        </tr>
        {#if expandable && open && traces}
          <tr>
            <td colspan="2" class="bg-ink-950/50 px-4 py-3 pl-10">
              <Trace data={traces} expanded={true} />
            </td>
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
</div>
