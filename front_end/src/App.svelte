<script>
  // IMPORTS
  import { slide } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { onDestroy } from "svelte";
  import DonationButton from "./DonationButton.svelte";

  // DATA
  let score = [];
  let search = "";
  let state = {};

  // Constants
  const admin = window.location.pathname === "/admin";
  const eventSource = new EventSource("/event-stream");
  eventSource.onmessage = (m) => {
    const data = JSON.parse(m.data);
    score = data.list;
    state = data.state;
  };

  // COMPUTED
  $: correctScore = score.map((it) => ({ ...it, count: parseInt(it.count) }));
  $: sorter = admin ? sortByName : sortByPoints;
  $: sortedScore = correctScore.slice().sort(sorter);
  $: filteredScore = sortedScore.filter(({ name }) =>
    name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
  );

  // METHODS
  const sortByPoints = (a, b) => b.points - a.points;
  const sortByName = (a, b) => b.name.localeCompare(a.name);
  function updateState(newState) {
    fetch("/api/setState", {
      method: "PUT",
      cache: "no-cache",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: newState }),
    });
  }

  // LIFECYCLE
  onDestroy(eventSource.close);
</script>

<svelte:head>
  <title>En Gång Till!</title>
</svelte:head>

<main>
  <video muted autoplay loop src="/video.mp4" type="video/mp4" />
  {#if admin}
    <input bind:value={search} />
  {/if}
  <div class="card">
    <ul class="bidrag">
      {#if admin}
        {#each filteredScore as { name, points }, i (name)}
          <li class={"adminStyle"}>
            <h3>
              <img
                src={`/${name.toLocaleLowerCase().slice(0, 3).png}`}
                alt="logo"
                class="logo"
              />
              <span>{name}</span>
              <span>{points}</span>
              <DonationButton
                {name}
                updatePoints={async (points) => {
                  updateState({ ...state, [name]: points });
                }}
              />
              <button
                on:click={async () => {
                  updateState({ currentJudge: name });
                }}
              >
                välj {name}
              </button>
            </h3>
          </li>
        {/each}
      {:else}
        {#each sortedScore as { name, points }, i (name + "admin")}
          <li animate:flip transition:slide={{ delay: 150, duration: 150 }}>
            <h3 class={state[name] ? "got-point" : ""}>
              {#if state[name]}
                <div class="siffra">{state[name]}</div>
              {:else}
                <span class="logo-container">
                  <img
                    src={`/${name.toLocaleLowerCase().slice(0, 3)}.png`}
                    alt="logo"
                    class="logo"
                  />
                </span>
              {/if}
              <div class="textopoints">
                <span>{name}</span>
                <span>{points}</span>
              </div>
            </h3>
          </li>
        {/each}
      {/if}
    </ul>

    <div class="spex">
      <img class="bild" style="width: 100%" src="/guy.png" alt="lagbild" />
      <div class="namn">{state.currentJudge || ""}</div>
    </div>
  </div>
</main>

<!-- todo, skugga gradient, fontval, loggor, färger 

    background-color: rgb(25, 50, 88, 0.2);

    /*background-color: rgb(14, 36, 51, 0.7);*/
-->
<style>
  .card {
    margin: 100px 60px;
    width: calc(100% - 120px);
    background-image: linear-gradient(
      90deg,
      rgb(14, 36, 51, 0.8) 0%,
      rgba(0, 212, 255, 0.3) 50%,
      rgb(14, 36, 51, 0.8) 100%
    );

    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    padding: 50px 50px 25px 50px;
    display: flex;
    justify-content: space-between;

    border-radius: 3px;
  }

  .siffra {
    width: 100px;
    max-height: 100px;
    background-color: rgba(51, 135, 234);
    font-size: 3em;
    text-align: center;
    margin: -10px;
    padding-top: 10px;
  }
  .logo {
    max-height: 56px;
    max-width: 56px;
  }
  .logo-container {
    width: 56px;
    display: flex;
    justify-content: center;
  }
  .bild {
    height: 660px;
    object-fit: none;
  }

  .namn {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 5px;
    font-size: 3.8em;
    font-weight: 300;
    height: 100px;
    background-color: rgb(0, 0, 0, 0.3);
    padding-top: 8px;
    text-decoration: underline;
  }
  .spex {
    width: 35%;
  }

  video {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    z-index: -1;
  }
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  li {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  h3 {
    padding: 15px 25px 15px 10px;
    margin: 0;
    margin-bottom: 15px;
    background-color: rgb(0, 0, 0, 0.7);
    display: flex;
    border-radius: 3px;
    transition: background-color 500ms linear;
  }

  .got-point {
    background: linear-gradient(
      90deg,
      rgba(24, 54, 104, 0.9) 0%,
      rgba(46, 125, 232, 0.9) 100%
    );
  }
  img {
    border-radius: 3px;
  }
  .textopoints {
    padding-left: 30px;
    display: flex;
    justify-content: space-between;
    text-transform: uppercase;
    font-size: 3em;
    vertical-align: super;
    flex-grow: 1;
  }
  ul {
    padding: 0;
    padding-right: 15px;
    margin: 0;
    flex-grow: 1;
  }

  :global(body) {
    background-color: black;
    color: white;
  }

  input {
    margin: 0.5em;
  }

  .adminStyle {
    display: flex;
  }
</style>
