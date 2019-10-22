<script>
  // IMPORTS
  import { slide } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { onDestroy } from "svelte";

  // DATA
  let bongs = [];

  const admin = window.location.pathname === "/admin";
  const eventSource = new EventSource("/event-stream");
  eventSource.onmessage = m => {
    bongs = JSON.parse(m.data);
  };

  // COMPUTED
  $: correctBongs = bongs.map(it => ({ ...it, count: parseInt(it.count) }));
  $: total = correctBongs.reduce((acc, { count }) => acc + count, 0);
  $: sortedBongs = correctBongs.slice().sort(admin ? sortByName : sortByPoints);

  // METHODS
  const sortByPoints = (a, b) => b.count - a.count;
  const sortByName = (a, b) => b.name < a.name;
  const dec = (name, count) => () => count > 0 && alter("/api/dec", name);
  const inc = name => () => alter("/api/inc", name);

  const alter = (url, name) => {
    fetch(url, {
      method: "PUT",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name })
    });
    // Ignore resp, since we get it from eventSource
  };

  // LIFECYCLE
  onDestroy(eventSource.close);
</script>

<style>
  li {
    display: flex;
  }
</style>

<svelte:head>
  <title>Sandras BongBeräknare 300H</title>
</svelte:head>

<h1>Sandras BongBeräknare 300H</h1>
<h1>Totalt: {total}</h1>

<ul>
  {#each sortedBongs as { name, count } (name)}
    <li animate:flip transition:slide={{ delay: 250, duration: 300 }}>
      {#if admin}
        <button on:click={dec(name, count)}>färre</button>
      {/if}
      <h3>{count}. {name}</h3>
      {#if admin}
        <button on:click={inc(name)}>fler</button>
      {/if}
    </li>
  {/each}
</ul>
