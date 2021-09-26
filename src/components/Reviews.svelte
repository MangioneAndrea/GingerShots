<script>
  import { Dialog } from "svelte-materialify";
  import Review from "../components/Review.svelte";
  import { user } from "../services/firebase-auth";
  import { lastKnownUser } from "../services/firebase-firestore";
  import CardSlider from "../templates/CardSlider.svelte";
  export let open;
  export let shot;

  let cards = shot.reviews;

  console.log(cards)

  if (!cards.some((c) => c.authorId === $user?.uid)) {
    cards = [
      ...cards,
      {
        author: lastKnownUser.nickname,
        authorId: $user?.uid,
        date: new Date(),
      },
    ];
  }


  let index = cards.findIndex((el) => el.authorId === $user?.uid);
</script>

<Dialog bind:active={open} class="reviewDialog">
  <CardSlider template={Review} {cards} templateFeed={{ shot }} {index} />
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
