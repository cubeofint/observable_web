<script lang="ts">
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>{$page.status} · Observable</title>
</svelte:head>

<main class="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
  <p class="text-sm font-medium uppercase tracking-wider text-ember-400">{$page.status}</p>
  <h1 class="mt-2 text-3xl font-semibold">{$page.error?.message ?? 'Something went wrong'}</h1>
  <p class="mt-3 text-zinc-400">Open a profile from the home page or check the link.</p>
  <a href="/" class="mt-6 w-fit no-underline">Back to Observable</a>
</main>
