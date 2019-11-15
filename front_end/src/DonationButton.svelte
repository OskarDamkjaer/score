<script>
  //  PROPS
  export let name;

  // DATA
  let newDonation = 0;
  let showInputField = false;

  // METHODS
  const setDonation = () =>
    alter("/api/setDonation", { name, donation: newDonation });

  const hide = () => (showInputField = false);
  const show = () => (showInputField = true);
  const setAndHide = e => {
    e && e.preventDefault();
    setDonation();
    hide();
  };

  const mob = () => {
    const ny = prompt("skriv in siffra i öra");
    const siffra = parseInt(ny);

    if (siffra || siffra >= 0) {
      newDonation = siffra;
      setAndHide();
    }
  };

  const alter = (url, data) => {
    fetch(url, {
      method: "PUT",
      cache: "no-cache",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    // Ignore resp, since we get what we want from eventSource
  };
</script>

<style>
  button {
    font-size: 1rem;
  }
  input {
    font-size: 1rem;
  }
</style>

<div>
  {#if !showInputField}
    <button on:click={show}>ändra donation</button>
    <button on:click={mob}>samma men för mobil</button>
  {:else}
    <form on:submit={setAndHide}>
      <input type="number" bind:value={newDonation} />
      <button on:click={hide}>avbryt</button>
      <button type="submit">klar (skriv ören)</button>
    </form>
  {/if}
</div>
