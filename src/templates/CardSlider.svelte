<script>
  import { mdiSkipNext, mdiSkipPrevious } from "@mdi/js";
  import { Card, Button, Icon } from "svelte-materialify";
  import { slide } from "svelte/transition";
  export let template;
  export let cards = ["first", "second", "third", "fourth", "fifth"];
  export let templateFeed = {};
  export let index = 0;
  
</script>

<div class="container">
  <div
    class="previous side"
    transition:slide
    on:introstart
    on:outrostart
    on:introend
    on:outroend
  >
    <div>
      {#if cards[index - 1]}
        <Card>
          <svelte:component this={template} {...cards[index - 1]} />
        </Card>
      {/if}
      <Button
        icon
        depressed
        disabled={index <= 0}
        on:click={() => {
          index--;
        }}
      >
        <Icon path={mdiSkipPrevious} />
      </Button>
    </div>
  </div>
  <div
    class="selected side"
    transition:slide
    on:introstart
    on:outrostart
    on:introend
    on:outroend
  >
    <div>
      <Card>
        <svelte:component this={template} {...cards[index]} {...templateFeed} />
      </Card>
    </div>
  </div>
  <div
    class="next side"
    transition:slide
    on:introstart
    on:outrostart
    on:introend
    on:outroend
  >
    <div>
      {#if cards[index + 1]}
        <Card>
          <svelte:component this={template} {...cards[index + 1]} />
        </Card>
      {/if}

      <Button
        icon
        disabled={index >= cards.length - 1}
        on:click={() => {
          index++;
        }}
      >
        <Icon path={mdiSkipNext} />
      </Button>
    </div>
  </div>
</div>

<style type="text/scss">
  div.container {
    display: flex;
    flex-direction: row;
    div.side {
      width: 50%;

      @media only screen and (max-width: 768px) {
        width: 10%;
        &.selected {
          width: 80%;
        }
        &:not(.selected) {
          :global(.s-card) {
            display: none;
          }
        }
      }
      &.next {
        :global(.s-card) {
          -webkit-mask-image: -webkit-gradient(
            linear,
            left top,
            right top,
            from(rgba(255, 255, 255, 1)),
            to(rgba(0, 0, 0, 0))
          );
        }
      }
      &.previous {
        :global(.s-card) {
          -webkit-mask-image: -webkit-gradient(
            linear,
            right top,
            left top,
            from(rgba(255, 255, 255, 1)),
            to(rgba(0, 0, 0, 0))
          );
        }
      }

      height: inherit;
      position: relative;
      margin: 8px;
      :global(button) {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0.7;
        &:hover {
          opacity: 1;
        }
      }
      &.previous > :global(div > div.s-card),
      &.next > :global(div > div.s-card) {
        opacity: 0.2;
      }
      &.previous > div > :global(button) {
        right: 0;
      }
      &.next > div > :global(button) {
        left: 0;
      }
    }
  }
</style>
