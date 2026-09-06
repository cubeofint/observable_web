<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { localData, notification } from '$lib/stores';
  import logo from '../assets/logo.png';

  onMount(() => {
    const hash = $page.url.hash;
    if (hash) goto(`/profile/${hash.slice(1)}`);
  });

  let files: FileList | null = null;
  let dragging = false;

  function openProfile(file: File) {
    file.arrayBuffer().then((data) => {
      try {
        let string_data = new TextDecoder().decode(data);
        $localData = JSON.parse(string_data);
        goto('/p');
      } catch (e) {
        $notification = `Couldn't open ${file.name}: ${e}`;
      }
    });
  }

  $: if (files && files?.length > 0) {
    openProfile(files[0]);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    dragging = false;
    const dropped = event.dataTransfer?.files;
    if (dropped && dropped.length > 0) {
      openProfile(dropped[0]);
    }
  }
</script>

<svelte:head>
  <title>Observable</title>
</svelte:head>

<div class="min-h-screen">
  <header class="border-b border-ink-700 bg-ink-900">
    <div class="mx-auto flex max-w-3xl items-center gap-3 px-6 py-4">
      <img src={logo} alt="Observable logo" class="h-11 w-11 rounded-xl shadow-panel" />
      <div>
        <h1 class="text-xl font-semibold tracking-tight">Observable</h1>
        <p class="text-sm text-zinc-400">
          a thing by <a href="https://tas.sh">tas</a>
        </p>
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-3xl space-y-8 px-6 py-8">
    <form>
      <label
        for="file-upload"
        class="panel flex cursor-pointer flex-col items-center justify-center border-dashed px-6 py-10 text-center transition
          {dragging ? 'border-ember-400 bg-ink-700' : 'hover:border-ember-400/70 hover:bg-ink-700'}"
        on:dragover|preventDefault={() => (dragging = true)}
        on:dragleave={() => (dragging = false)}
        on:drop={onDrop}
      >
        <p class="text-lg font-medium text-sky-300">Open a local profile</p>
        <p class="mt-1 text-sm text-zinc-400">Drop a .json file here or click to browse</p>
      </label>
      <input type="file" id="file-upload" class="hidden" bind:files accept=".json" />
    </form>

    <section class="panel p-6">
      <h2 class="text-xl font-semibold">What is this?</h2>
      <p class="mt-3 leading-relaxed text-zinc-300">
        Observable profiles (tile) entities and shows you what's taking up tick time and where. It's
        available for Minecraft 1.16 - 1.21 on (Neo)Forge and Fabric. Get it on
        <a href="https://www.curseforge.com/minecraft/mc-mods/observable">CurseForge</a>,
        <a href="https://modrinth.com/mod/observable">Modrinth</a>, or
        <a href="https://github.com/tasgon/observable/releases">GitHub</a>.
      </p>
    </section>

    <section class="panel p-6">
      <h2 class="text-xl font-semibold">How do I use it?</h2>
      <p class="mt-3 leading-relaxed text-zinc-300">
        First, make sure you have permissions to run it. By default, only server operators can use
        the tool. They can allow everyone to use the tool by running:
      </p>
      <ul class="mt-3 list-disc space-y-1 pl-6 text-zinc-300">
        <li>
          <code class="rounded bg-ink-900 px-1.5 py-0.5">/observable set allPlayersAllowed true</code>
          to allow everyone, or
        </li>
        <li>
          <code class="rounded bg-ink-900 px-1.5 py-0.5">/observable allow &lt;username&gt;</code>
          to allow a specific user.
        </li>
      </ul>
      <p class="mt-4 leading-relaxed text-zinc-300">
        Once that's taken care of, bind the "Show profiler screen" key to whatever you prefer, or
        run <code class="rounded bg-ink-900 px-1.5 py-0.5">/observable run &lt;duration&gt;</code>
        if you're an operator.
      </p>
    </section>

    <section class="panel p-6">
      <h2 class="text-xl font-semibold">I'm still confused!</h2>
      <p class="mt-3 leading-relaxed text-zinc-300">
        I have an incomplete wiki available
        <a href="https://github.com/tasgon/observable/wiki">here</a>
        or you can talk to me on
        <a href="https://discord.gg/sfPbb3b5tF">Discord</a>.
      </p>
    </section>
  </main>
</div>
