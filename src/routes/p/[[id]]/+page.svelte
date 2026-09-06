<script lang="ts">
  import { copyTPCommand, formatMicrosPerTick } from '$lib/utils';
  import type { PageData } from './$types';

  export let data: PageData;

  const WINDOW_SIZE = 100;

  let query = '';

  $: dim_map = data.entries.map(({ name: dim, entries, rate }) => {
    return {
      dim,
      rate,
      enabled: true,
      offset: 0,
      entries: entries.filter((i) => i.type.includes(query))
    };
  });

  $: maxRate = Math.max(...dim_map.map((d) => d.rate), 1);
</script>

<div class="mb-3">
  <input bind:value={query} placeholder="Search entries..." class="field max-w-xl" />
</div>

<div class="panel overflow-x-auto">
  <table class="data-table">
    {#each dim_map as { dim, rate, enabled, entries, offset }}
      {@const slice = entries.slice(offset, Math.min(offset + WINDOW_SIZE, entries.length))}
      <tbody>
        <tr class="section-row" on:click={() => (enabled = !enabled)}>
          <td class="font-semibold">
            <span class="text-zinc-400">{enabled ? '−' : '+'}</span>
            {dim}
            <span class="ml-2 font-normal text-zinc-400">{entries.length} entries</span>
          </td>
          <td class="w-48">
            <div class="flex items-center gap-3">
              <div class="rate-bar w-24">
                <span style="width: {(100 * rate) / maxRate}%"></span>
              </div>
              <span class="font-mono text-zinc-200">{formatMicrosPerTick(rate)}</span>
            </div>
          </td>
          <td class="w-[30%] text-zinc-400">Position</td>
        </tr>
        {#if enabled}
          <tr
            class="cursor-pointer text-sky-300"
            on:click={() => (offset -= WINDOW_SIZE)}
            hidden={offset == 0}
          >
            <td colspan="3" class="pl-8">− previous {WINDOW_SIZE}</td>
          </tr>
          {#each slice as entry}
            {@const { x, y, z } = entry.position}
            <tr class="hover:bg-ink-800/70">
              <td class="pl-8 font-mono text-zinc-200">{entry.type}</td>
              <td class="font-mono text-zinc-300">{formatMicrosPerTick(entry.rate)}</td>
              <td>
                <span class="mr-3 font-mono text-zinc-400">({x}, {y}, {z})</span>
                <button
                  type="button"
                  class="visit-btn"
                  on:click={() => {
                    copyTPCommand(dim, entry.entityId ?? entry.position);
                  }}
                >
                  Visit
                </button>
              </td>
            </tr>
          {/each}
          <tr
            class="cursor-pointer text-sky-300"
            on:click={() => (offset += WINDOW_SIZE)}
            hidden={offset + WINDOW_SIZE > entries.length}
          >
            <td colspan="3" class="pl-8">+ next {WINDOW_SIZE}</td>
          </tr>
        {/if}
      </tbody>
    {/each}
  </table>
</div>
