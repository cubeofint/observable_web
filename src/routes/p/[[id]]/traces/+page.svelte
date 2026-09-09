<script lang="ts">
  import Trace from '$lib/Trace.svelte';
  import type { LayoutData } from '../$types';

  export let data: LayoutData;

  $: traces = data.profile.traces;
</script>

{#if traces}
  <div class="panel p-4">
    <Trace data={traces} />
  </div>
{:else}
  <div class="panel px-6 py-10 text-center text-zinc-400">No traces available</div>
{/if}
