<script>
  import { Dialog } from "svelte-materialify";
  import Review from "../components/Review.svelte";
  import { user } from "../services/firebase-auth";
  import CardSlider from "../templates/CardSlider.svelte";
  export let open;
  export let shot;

  let cards = [];

  if (!cards.some((c) => c.author === $user?.uid)) {
    cards = [{ author: $user?.uid, date: new Date() }, ...cards];
  }
</script>

<Dialog bind:active={open} class="reviewDialog">
  <CardSlider template={Review} {cards} templateFeed={{ shot }} />
</Dialog>

<style type="text/scss">
  :global(div.reviewDialog.s-dialog__content) {
    background: none;
    box-shadow: none;
    width: 100%;
  }
  div.title {
    display: flex;
    width: 100%;
    justify-content: space-between;

    :global(& > div) {
      flex: 1;
    }
  }
  :global(div.s-dialog) {
    position: fixed;
  }
</style>
