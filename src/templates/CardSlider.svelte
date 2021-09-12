<script>
  import { mdiSkipNext, mdiSkipPrevious } from '@mdi/js';
  import { Card, Button, Icon } from 'svelte-materialify';
  import { slide } from 'svelte/transition';

  let focussedCard = 0;

  export let cards = ['first', 'second', 'third', 'fourth', 'fifth'];
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
      {#if cards[focussedCard - 1]}
        <Card>
          {cards[focussedCard]}
        </Card>
      {/if}
      <Button
        icon
        on:click={() => {
          focussedCard--;
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
        {cards[focussedCard] || ''}
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
      {#if cards[focussedCard + 1]}
        <Card>
          {cards[focussedCard + 1]}
        </Card>
      {/if}

      <Button
        icon
        on:click={() => {
          focussedCard++;
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
      width: 33%;
      min-width: 70px;
      height: inherit;
      position: relative;
      margin: 8px;
      :global(button) {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0.7;
        &::hover {
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
