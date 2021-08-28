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

    let open = false;

    const openReview = () => {
        open = true;
    };

    const reviews = [
        {
            Maker: "Andrea",
            Date: new Intl.DateTimeFormat("ch").format(new Date()),
            Ingredients: ["Ginger", "Honey"],
            Ratings: [4,3],
        },
    ];
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
                    <DataTableCell>{review.Date}</DataTableCell>
                    <DataTableCell>{review.Maker}</DataTableCell>
                    <DataTableCell
                        >{review.Ingredients.join(", ")}</DataTableCell
                    >
                    <DataTableCell>
                        <Stars rating={review.Ratings.average()} />
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
