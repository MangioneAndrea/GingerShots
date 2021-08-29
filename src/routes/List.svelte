<script>
  import {
    DataTable,
    DataTableHead,
    DataTableRow,
    DataTableCell,
    DataTableBody,
    Icon,
    Button,
  } from "svelte-materialify";
  import { mdiBookSearchOutline } from "@mdi/js";
  import Review from "../components/Review.svelte";
  import Stars from "../templates/Stars.svelte";
  import { getShots } from "../services/firebase-firestore";

  let open = false;

  const openReview = () => {
    open = true;
  };

  let reviews = [];

  getShots().then((result) => {
    reviews = result;
  });
</script>

<div class="container">
  <DataTable>
    <DataTableHead>
      <DataTableRow>
        <DataTableCell>Date</DataTableCell>
        <DataTableCell>Author</DataTableCell>
        <DataTableCell>Ingredients</DataTableCell>
        <DataTableCell>Rating</DataTableCell>
      </DataTableRow>
    </DataTableHead>
    <DataTableBody>
      {#each reviews as review}
        <DataTableRow>
          <DataTableCell>{review.date}</DataTableCell>
          <DataTableCell>{review.author}</DataTableCell>
          <DataTableCell>{review.ingredients?.join(", ")}</DataTableCell>
          <DataTableCell>
            <Stars rating={review.ratings?.average()} />
          </DataTableCell>
          <DataTableCell>
            <Button icon on:click={openReview}>
              <Icon path={mdiBookSearchOutline} />
            </Button>
          </DataTableCell>
        </DataTableRow>
      {/each}
    </DataTableBody>
  </DataTable>
  {#if open}
    <Review {open} />
  {/if}
</div>

<style type="text/scss">
  div.container {
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>
