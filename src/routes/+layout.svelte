<script lang="ts">
  import '../app.css';
  import { notification } from '$lib/stores';

  $: if ($notification) {
    setTimeout(() => ($notification = ''), 2000);
  }
</script>

<slot />

{#if $notification}
  <div
    class="fixed bottom-6 right-6 z-50 max-w-md rounded-lg border border-ink-600 bg-ink-800/95 px-4 py-3 text-sm text-zinc-100 shadow-panel backdrop-blur"
  >
    {@html $notification}
  </div>
{/if}
