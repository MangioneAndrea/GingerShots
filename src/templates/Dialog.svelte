<script>
  import { Overlay } from "svelte-materialify";
  import { scale } from "svelte/transition";

  export let active = false;
  export let transparent = false;
  export let transition = scale;
  export let overlay = {};

  function close() {
    active = false;
  }
</script>

<div
  class="dialog"
  class:transparent
  transition:transition={{ duration: 300, start: 0.1 }}
  on:introstart
  on:outrostart
  on:outroend
>
  <div class="wrapper" class:transparent>
    <slot />
  </div>
</div>
<Overlay {...overlay} on:click={close} />

<style type="text/scss">
  .dialog {
    align-items: center;

    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    left: 0;
    pointer-events: none;
    position: fixed;
    top: 0;
    z-index: inherit;
    outline: none;
    &:not(.transparent) {
      background-color: var(--theme-surface);
    }

    // border-radius:  $border-radius-root ;
    .wrapper {
      margin: 24px;
      overflow-y: auto;
      pointer-events: auto;
      z-index: 6;
      &:not(.transparent) {
        box-shadow: 0 11px 15px -7px rgba(0, 0, 0, 0.2),
          0 24px 38px 3px rgba(0, 0, 0, 0.14),
          0 9px 46px 8px rgba(0, 0, 0, 0.12);
      }

      max-height: 90%;
    }
  }
</style>
