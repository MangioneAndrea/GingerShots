<script>
  import { mdiStarOutline, mdiStarHalfFull, mdiStar } from "@mdi/js";
  import { Icon } from "svelte-materialify";

  export let rating;
  export let clickable = false;

  const getStar = (star, rating) => {
    const rounded = Math.round(rating * 2) / 2;
    if (rounded >= star) return mdiStar;
    if (rounded + 0.5 === star) return mdiStarHalfFull;
    return mdiStarOutline;
  };

  const setRating = (to) => {
    rating = to;
  };
</script>

<div class="child">
  {#each [1, 2, 3, 4, 5] as star}
    <Icon path={getStar(star, rating)} />
  {/each}
</div>
{#if clickable}
  <div class="child">
    {#each [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as star}
      <div class="clickable" on:click={() => setRating(star)} />
    {/each}
  </div>
{/if}

<style type="text/scss">
  div.container {
    position: relative;
    width: 120px;
    div.child {
      position: absolute;
      width: 120px;
      top: 70%;
      margin: 0;
      -ms-transform: translateY(-70%);
      transform: translateY(-70%);

      div.clickable {
        display: inline-block;
        margin: 0;
        position: relative;
        height: 24px;
        width: 12px;
      }
    }
  }
</style>
