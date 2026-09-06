<script lang="ts">
  import { formatMicros } from '$lib/utils';
  import type { Entry, Profile } from '$lib/types';
  import type { PageData } from './$types';

  export let data: PageData;

  function getAggregateData(profile: Profile) {
    let entries = [
      ...(Object.values(profile.blocks).flat() as Entry[]),
      ...(Object.values(profile.entities).flat() as Entry[])
    ];
    let aggregateMap: Map<string, { duration: number; count: number }> = new Map();
    for (const e of entries) {
      let val = aggregateMap.get(e.type) ?? { duration: 0, count: 0 };
      val.duration += e.rate * e.ticks;
      val.count++;
      aggregateMap.set(e.type, val);
    }
    return Array.from(aggregateMap.entries()).sort(([_1, a], [_2, b]) => {
      return b.duration - a.duration;
    });
  }

  $: aggregates = getAggregateData(data.profile);
  $: total = aggregates.reduce((acc, [, { duration }]) => acc + duration, 0);
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
      {#each aggregates as [name, { duration, count }]}
        <tr class="hover:bg-ink-800/70">
          <td>
            <span class="font-medium">{name}</span>
            <span class="ml-2 text-zinc-400">×{count}</span>
          </td>
          <td class="font-mono">
            <div class="flex items-center gap-3">
              <div class="rate-bar w-28">
                <span style="width: {total ? (100 * duration) / total : 0}%"></span>
              </div>
              {formatMicros(duration)}
              <span class="text-zinc-400">({total ? ((100 * duration) / total).toFixed(1) : '0.0'}%)</span>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
