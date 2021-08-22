<script>
    import {
        Button,
        Card,
        CardActions,
        CardText,
        CardTitle,
        Dialog,
        Textarea,
    } from "svelte-materialify";
    import { user } from "../services/firebase";
    import Stars from "../templates/Stars.svelte";
    export let open = false;
    export let description = "";
    export let author = "";
    export let rating;

    const isUserAuthor = author && $user?.getEmail() === author;
    const saveAndClose = async () => {
        close();
    };
    const close = async () => {
        open = false;
    };
</script>

<Dialog bind:active={open}>
    <Card raised>
        <CardTitle>
            <div class="title">
                {#if isUserAuthor}
                    Leave your review
                {:else}
                    Read review
                {/if}
                <div />
                <Stars clickable={isUserAuthor} {rating} />
            </div>
        </CardTitle>
        <br />
        <CardText>
            <Textarea bind:value={description}>Description</Textarea>
        </CardText>
        <CardActions>
            {#if isUserAuthor}
                <Button text class="primary-text" on:click={saveAndClose}>
                    Save review
                </Button>
            {/if}
            <Button text class="primary-text" on:click={close}>Close</Button>
        </CardActions>
    </Card>
</Dialog>

<style type="text/scss">
    div.title {
        display: flex;
        width: 100%;
        justify-content: space-between;

        :global(& > div) {
            flex: 1;
        }
    }
</style>
