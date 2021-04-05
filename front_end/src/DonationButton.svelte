<script>
  //  PROPS
  export let name;
  export let updatePoints;

  // METHODS
  const setPoints = (points) => {
    updatePoints(points);
    alter("/api/addPoints", { name, points });
  };
  const reset = () => {
    updatePoints(0);
    alter("/api/reset", { name });
  };

  const alter = (url, data) => {
    fetch(url, {
      method: "PUT",
      cache: "no-cache",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    // Ignore resp, since we get what we want from eventSource
  };

  // Constants
  const possiblePoints = [12, 10, 8, 5, 2];
</script>

<div>
  {#each possiblePoints as point}
    <button on:click={() => setPoints(point)}>{point}</button>
  {/each}
  <button on:click={reset}> nollställ </button>
</div>

<style>
  button {
    font-size: 1rem;
  }
</style>
