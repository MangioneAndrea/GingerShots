<script>
  import { snacks } from "../services/snackbar";
  import { Button } from "svelte-materialify";
  import { scale } from "svelte/transition";
</script>

<div class="container">
  {#each $snacks as snack}
    <div
      transition:scale
      on:introstart
      on:outrostart
      on:introend
      on:outroend
      class="snackbar"
    >
      {snack.message}
      <Button
        class="red-text"
        text
        on:click={() => {
          snack.close();
        }}
      >
        Dismiss
      </Button>
    </div>
  {/each}
</div>

<style type="text/scss">
  div.container {
    position: fixed;
    right: 0;
    left: unset;
    top: 50px;
    z-index: 5;
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .snackbar {
      display: flex;
      align-items: center;
      position: relative;
      pointer-events: auto;
      padding: 10px 16px;
      font-size: 0.875rem;
      letter-spacing: 0.0178571429em;
      background-color: #333;
      color: hsla(0, 0%, 100%, 0.87);
      margin: 4px;
      margin-left: 8px;
      min-height: 48px;
      min-width: 344px;
      border-radius: 4px;
      box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2),
        0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);
      :global(.s-btn) {
        margin: 0;
        margin-left: auto;
      }
    }
  }
</style>
