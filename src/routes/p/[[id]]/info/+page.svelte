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
        return `${key} ${this.open ? '-' : '+'}`;
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

<table class="overflow-auto">
  {#each extraData as i}
    <tr on:click={(_) => (i.open = !i.open)} class="header">{i.label()}</tr>
    {#if i.open}
      <tr>
        <code>{i.val}</code>
      </tr>
    {/if}
  {/each}
</table>

<style scoped>
  .header {
    color: lightsteelblue;
  }

  .header:hover {
    cursor: pointer;
  }

  code {
    overflow: scroll;
    white-space: pre;
    display: block;
    padding-left: 1em;
  }
</style>
