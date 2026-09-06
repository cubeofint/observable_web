<script lang="ts">
  import { copyTPCommand, formatMicrosPerTick } from '$lib/utils';
  import type { PageData } from '../$types';

  export let data: PageData;

  $: chunkMap = data.entries.map(({ name, entries, rate }) => {
    let chunkList: Map<
      string,
      {
        chunk: { x: number; z: number };
        rate: number;
      }
    > = new Map();
    for (let entry of entries) {
      let { x, z } = entry.position;
      let chunk = { x: Math.floor(x / 16), z: Math.floor(z / 16) };
      let key = `x${chunk.x}z${chunk.z}`;
      let listEntry = chunkList.get(key) ?? {
        chunk,
        rate: 0
      };
      listEntry.rate += entry.rate;
      chunkList.set(key, listEntry);
    }
    let chunks = Array.from(chunkList)
      .sort(([_, a], [_2, b]) => b.rate - a.rate)
      .map(([_, entry]) => {
        return entry;
      });
    return { name, chunks, rate, enabled: true };
  });

  $: maxRate = Math.max(...chunkMap.map((d) => d.rate), 1);
</script>

<div class="panel overflow-x-auto">
  <table class="data-table">
    {#each chunkMap as { name, chunks, rate, enabled }}
      <tbody>
        <tr class="section-row" on:click={() => (enabled = !enabled)}>
          <td class="w-1/2 font-semibold">
            <span class="text-zinc-400">{enabled ? '−' : '+'}</span>
            {name}
            <span class="ml-2 font-normal text-zinc-400">{chunks.length} chunks</span>
          </td>
          <td>
            <div class="flex items-center gap-3">
              <div class="rate-bar w-24">
                <span style="width: {(100 * rate) / maxRate}%"></span>
              </div>
              <span class="font-mono">{formatMicrosPerTick(rate)}</span>
            </div>
          </td>
          <td class="text-zinc-400">Position</td>
        </tr>
        {#if enabled}
          {#each chunks as entry}
            {@const { x, z } = entry.chunk}
            {@const position = {
              x: x * 16 + 8,
              y: 128,
              z: z * 16 + 8
            }}
            <tr class="hover:bg-ink-800/70">
              <td class="pl-8 font-mono">({x}, {z})</td>
              <td class="font-mono text-zinc-300">{formatMicrosPerTick(entry.rate)}</td>
              <td>
                <button type="button" class="visit-btn" on:click={() => copyTPCommand(name, position)}>
                  Visit
                </button>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    {/each}
  </table>
</div>
