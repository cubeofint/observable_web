<script lang="ts">
  import { type Trace } from '$lib/types';
  import Minus from 'lucide-svelte/icons/minus';
  import Plus from 'lucide-svelte/icons/plus';
  export let data: Trace;
  export let total: number | undefined = undefined;
  export let expanded = true;
</script>

<div class="w-full">
  <button
    class="flex w-full flex-row items-center rounded-md px-1 py-0.5 text-left hover:bg-ink-700"
    on:click={() => (expanded = !expanded)}
  >
    <span class="text-sky-300" class:invisible={data.children.length === 0}>
      <svelte:component this={expanded ? Minus : Plus} size={16} />
    </span>
    <code class="pl-2 text-zinc-200">{data.className}:{data.methodName}</code>
    <span class="ml-auto font-mono text-xs text-zinc-400">
      {((100.0 * data.count) / (total ?? data.count)).toFixed(2)}%
    </span>
  </button>
  {#if expanded}
    <div class="ml-2 border-l border-ink-600 pl-4" class:border-l-0={data.children.length <= 1}>
      {#each data.children as trace}
        <svelte:self
          data={trace}
          total={total ?? data.count}
          expanded={data.children.length === 1}
        />
      {/each}
    </div>
  {/if}
</div>
