<script>
  import "firebase/auth";

  import { MaterialAppMin } from "svelte-materialify";

  import Login from "./components/Login.svelte";
  import NavBar from "./components/NavBar.svelte";
  import Snackbars from "./components/Snackbars.svelte";
  import Home from "./routes/Home.svelte";
  import ConfirmDialog from "./templates/ConfirmDialog.svelte";

  let page = Home;
  let theme = localStorage.getItem("theme") || "light";
  let loggingIn = false;
  let dialogOpts = { open: false };
  $: {
    if (theme) {
      localStorage.setItem("theme", theme);
    }
  }
</script>

<MaterialAppMin {theme}>
  <NavBar bind:page bind:theme bind:loggingIn bind:dialogOpts />
  <Login bind:open={loggingIn} />
  {#if dialogOpts.open}
    <ConfirmDialog {...dialogOpts} />
  {/if}
  <Snackbars />
  <svelte:component this={page} />
</MaterialAppMin>

<style>
  :global(body) {
    padding: 0;
  }
</style>
