<script lang="ts">
  import { page } from '$app/stores';
  import type { LayoutData } from './$types';
  import Clock from 'lucide-svelte/icons/clock';
  import Download from 'lucide-svelte/icons/download';
  import Hourglass from 'lucide-svelte/icons/hourglass';
  import User from 'lucide-svelte/icons/user';

  export let data: LayoutData;

  $: basePath = $page.params.id ? `/p/${$page.params.id}` : '/p';
  $: tabs = [
    { name: 'Individual', path: `${basePath}` },
    { name: 'Chunks', path: `${basePath}/chunks` },
    { name: 'Aggregate', path: `${basePath}/aggregated` },
    { name: 'Traces', path: `${basePath}/traces`, hidden: !data.profile.traces },
    { name: 'Info', path: `${basePath}/info` }
  ];

  $: info = data.diagnostics;

  $: user = 'unknown';
  $: if (info?.user) {
    fetch(`https://api.ashcon.app/mojang/v2/user/${info.user}`)
      .then((res) => res.json() as Promise<{ username: string }>)
      .then((res) => (user = res.username ?? 'unknown'));
  }
  $: duration = info?.duration ? Math.floor(info.duration / 1000.0).toString() : null;
</script>

<svelte:head>
  <title>Observable profile</title>
</svelte:head>

<div class="min-h-screen">
  <header class="sticky top-0 z-20 border-b border-ink-700 bg-ink-900/95 backdrop-blur">
    <div class="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
      <a href="/" class="w-fit text-sm font-semibold tracking-tight text-zinc-100 no-underline hover:text-ember-400">
        Observable
      </a>

      <nav class="flex flex-wrap gap-1">
        {#each tabs as { name, path, hidden }}
          {@const focused = $page.url.pathname === path}
          <a
            href={path}
            class="rounded-md px-3 py-1.5 text-sm no-underline transition {focused
              ? 'bg-ink-700 text-zinc-100'
              : 'text-zinc-400 hover:bg-ink-800 hover:text-zinc-100'}"
            class:hidden
          >
            {name}
          </a>
        {/each}
      </nav>

      <div class="flex flex-1 flex-wrap items-center gap-3 text-xs text-zinc-400 sm:justify-end">
        <span class="inline-flex items-center gap-1">
          <User size={14} />
          {user}
        </span>
        {#if info?.start}
          {@const date_str = new Date(info.start).toLocaleString()}
          <span class="inline-flex items-center gap-1">
            <Clock size={14} />
            {date_str}
          </span>
        {/if}
        {#if duration}
          <span class="inline-flex items-center gap-1">
            <Hourglass size={14} />
            {duration}s
          </span>
        {/if}
        {#if $page.params.id}
          <a
            href="/v1/get/{$page.params.id}"
            download="{$page.params.id}.json"
            class="inline-flex items-center gap-1 rounded-md border border-ink-600 bg-ink-800 px-2 py-1 text-zinc-200 no-underline hover:border-ember-400 hover:text-zinc-50"
          >
            <Download size={14} />
            JSON
          </a>
        {/if}
      </div>
    </div>
  </header>

  <div class="px-4 py-4">
    <slot />
  </div>
</div>
