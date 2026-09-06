<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;

  $: info = data.diagnostics;

  $: extraData = Object.entries(info?.additionalDiagnostics ?? {}).map(([key, val]) => {
    return {
      key,
      val: formatDiagnosticValue(val),
      open: true,
      label() {
        return `${key} ${this.open ? '−' : '+'}`;
      }
    };
  });

  function formatDiagnosticValue(val: unknown): string {
    if (typeof val === 'string') {
      return val;
    }
    if (val === null || val === undefined) {
      return String(val);
    }
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  }
</script>

{#if extraData.length === 0}
  <div class="panel px-6 py-10 text-center text-zinc-400">No extra diagnostics in this profile</div>
{:else}
  <div class="space-y-3">
    {#each extraData as i}
      <section class="panel overflow-hidden">
        <button
          type="button"
          class="section-row flex w-full items-center justify-between px-4 py-3 text-left font-medium"
          on:click={() => (i.open = !i.open)}
        >
          {i.label()}
        </button>
        {#if i.open}
          <pre class="max-h-[32rem] overflow-auto border-t border-ink-700 bg-ink-950/60 p-4 text-xs text-zinc-200">{i.val}</pre>
        {/if}
      </section>
    {/each}
  </div>
{/if}
