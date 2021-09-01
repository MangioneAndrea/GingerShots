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
  import { user } from "../services/firebase-auth";
  import { addShot, updateShot } from "../services/firebase-firestore";
  export let shot;
  export let open;
  export let onSave;

  let ingredients = shot?.ingredients?.join(", ") || "";
  let date = shot.date && new Date(shot.date).toISOString().split("T")[0];

  const isUserAuthor = shot?.authorId && $user?.uid === shot?.authorId;
  const isNew = !shot?.id;

  const saveAndClose = async () => {
    try {
      if (isNew) {
        await addShot(date, ingredients.split(", "));
        pushSnacks("New ginger-shot created!");
      } else {
        await updateShot({
          ...shot,
          date,
          ingredients: ingredients.split(", "),
        });
        pushSnacks("Ginger shot updated!");
      }
      onSave?.()
      close();
    } catch (err) {
      pushSnacks(err.message);
    }
  };
  const close = async () => {
    open = false;
  };
</script>

<Dialog bind:active={open} style={{ position: "fixed" }}>
  <Card raised>
    <CardTitle>
      <div class="title">
        <div>
          {#if isNew}
            Create shot
          {:else if isUserAuthor}
            Edit shot
          {:else}
            Shot
          {/if}
        </div>
        <input
          type="date"
          bind:value={date}
          disabled={!isNew && !isUserAuthor}
        />
      </div>
    </CardTitle>
    <br />
    <CardText>
      <Textarea bind:value={ingredients} disabled={!isNew && !isUserAuthor}>
        Ingredients
      </Textarea>
    </CardText>
    <CardActions>
      {#if isNew || isUserAuthor}
        <Button text class="primary-text" on:click={saveAndClose}>
          Save entry
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
  :global(div.s-dialog) {
    position: fixed;
  }
</style>
