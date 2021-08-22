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
        console.log(Math.round(rating * 2) / 2);
    };
</script>

<div class="container">
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
</div>

<style type="text/scss">
    div.container {
        position: relative;
        min-width: 120px;
        width: 100%;
        height: 100%;
        top: 50%;
        transform: translateY(-25%);
        div.child {
            position: absolute;
            width: 100%;

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
