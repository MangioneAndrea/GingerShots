<script>
  import { Dialog } from "svelte-materialify";
  import Review from "../components/Review.svelte";
  import CardSlider from "../templates/CardSlider.svelte";
  export let open;
</script>

<Dialog bind:active={open} class="reviewDialog">
  <CardSlider
    template={Review}
    cards={[
      { author: "Andrea", rating: 4, date: new Date(), description: "nice" },
      { author: "Toby", rating: 2, date: new Date() },
    ]}
  />
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
