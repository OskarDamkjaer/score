<script>
  // IMPORTS
  import { slide } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { onDestroy } from "svelte";

  // DATA
  let bongs = [];
  let search = "";

  const admin = window.location.pathname === "/admin";
  const eventSource = new EventSource("/event-stream");
  eventSource.onmessage = m => {
    bongs = JSON.parse(m.data);
  };

  // COMPUTED
  $: correctBongs = bongs.map(it => ({ ...it, count: parseInt(it.count) }));
  $: total = correctBongs.reduce((acc, { count }) => acc + count, 0);
  $: sorter = admin ? sortByName : sortByPoints;
  $: sortedBongs = correctBongs.slice().sort(sorter);
  $: displayBongs = admin
    ? sortedBongs.filter(({ name }) => name.includes(search))
    : sortedBongs;

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
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  li {
    display: flex;
    text-transform: uppercase;
    font-size: 2em;
    padding: 0;
    margin: 0.3rem;
  }

  h3 {
    padding: 0;
    margin: 0;
  }

  div {
    background-color: #ed4722;
    padding: 0.6em;
    margin-top: 1em;
    text-transform: uppercase;
  }

  h1 {
    font-size: 3em;
    margin: 0;
  }

  :global(body) {
    background-color: #00b298;
    color: white;
  }

  h2 {
    font-style: italic;
    font-size: 2.5em;
    margin: 0;
    margin-top: 0.5rem;
  }
  input {
    margin: 0.5em;
  }

  @media (max-width: 600px) {
    h1 {
      font-size: 2em;
    }
    h2 {
      font-size: 1.8em;
    }
    li {
      font-size: 1.5em;
    }
  }
</style>

<svelte:head>
  <title>Sandras BongBeräknare 300H</title>
</svelte:head>

<main>
  <div>
    <h1>#FIKA FÖR BARNEN</h1>
    <h2>{total} fikor hittills</h2>
  </div>
  {#if admin}
    <input bind:value={search} />
  {/if}
  <ul>
    {#each displayBongs as { name, count } (name)}
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
</main>
