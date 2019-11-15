<script>
  // IMPORTS
  import { slide } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { onDestroy } from "svelte";
  import DonationButton from "./DonationButton.svelte";

  // DATA
  let bongs = [];
  let search = "";
  let newDonation = "";

  // Constants
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
  $: filteredBongs = sortedBongs.filter(({ name }) =>
    name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
  );
  $: moneyPerBong = correctBongs.reduce(
    (acc, { donation }) => acc + donation,
    0
  );
  $: moneyForKids = (moneyPerBong * total) / 100;

  // METHODS
  const formatDonation = oren => {
    const paddedString = oren.toString().padStart(3, "0");
    const splitIndex = paddedString.length - 2;
    return [
      paddedString.substring(0, splitIndex),
      paddedString.substring(splitIndex)
    ].join(",");
  };
  const sortByPoints = (a, b) => b.count - a.count;
  const sortByName = (a, b) => b.name.localeCompare(a.name);
  const dec = name => () => alter("/api/dec", { name });
  const inc = name => () => alter("/api/inc", { name });
  const setDonation = name => () =>
    alter("/api/setDonation", { name, donation: newDonation });

  const alter = (url, data) => {
    fetch(url, {
      method: "PUT",
      cache: "no-cache",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    // Ignore resp, since we get what we want from eventSource
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
    list-style: none;
    text-transform: uppercase;
    font-size: 2em;
    padding: 0;
    margin: 0.3rem;
  }

  h3 {
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: auto 2em 4em;
  }
  ul {
    margin: 0;
    padding: 0;
  }

  div {
    background-color: #ed4722;
    padding: 0 1em 0.5em 1em;
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

  .adminStyle {
    display: flex;
  }

  #left {
    background-color: green;
  }

  #right {
    background-color: red;
  }

  @media (max-width: 550px) {
    h1 {
      font-size: 2em;
    }
    h2 {
      font-size: 1.8em;
    }
    li {
      font-size: 1.5em;
    }
    h3 {
      grid-template-columns: auto 4em;
      grid-template-rows: auto auto;
    }
    .donation {
      grid-column: 2;
    }
  }
</style>

<svelte:head>
  <title>Sandras BongBeräknare 300H</title>
</svelte:head>

<main>
  <div>
    <h1>#LOPTHETFÖRBARNEN</h1>
    <h2>{total} BONGADE HITTILLS</h2>
    <h2>{moneyForKids} KRONOR TILL BARNEN</h2>
  </div>
  {#if admin}
    <input bind:value={search} />
  {/if}
  <ul>
    {#if admin}
      {#each filteredBongs as { name, count, donation }, i (name)}
        <li class={'adminStyle'}>
          <h3>
            <span>{i + 1}. {name}</span>
            <span style="justify-self: end">{count}🍺</span>
            <span class="donation" style="justify-self: end">
              {formatDonation(donation)} 💸
            </span>
            <button id="left" on:click={inc(name)}>fler</button>
            <button id="right" on:click={dec(name)}>färre</button>
            <DonationButton {name} />
          </h3>
        </li>
      {/each}
    {:else}
      {#each sortedBongs as { name, count, donation }, i (name + 'admin')}
        <li animate:flip transition:slide={{ delay: 250, duration: 300 }}>
          <h3>
            <span>{name}</span>
            <span style="justify-self: end">{count}🍺</span>
            <span class="donation" style="justify-self: end">
              {formatDonation(donation)} 💸
            </span>
          </h3>
        </li>
      {/each}
    {/if}
  </ul>
</main>
