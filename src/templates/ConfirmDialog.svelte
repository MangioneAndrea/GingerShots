<script>
  import {
    Button,
    Card,
    CardActions,
    CardText,
    CardTitle,
    Dialog,
  } from "svelte-materialify";

  export let title;
  export let text;
  export let open;
  export let yes;
  export let no;

  const closeWith = (action) => {
    action && action();
    open = false;
  };
</script>

<Dialog bind:active={open}>
  <Card raised>
    <CardTitle>{title}</CardTitle>
    <br />
    <CardText>
      {text}
    </CardText>
    <CardActions>
      <Button text class="primary-text" on:click={() => closeWith(yes)}>
        Yes
      </Button>
      <Button text class="primary-text" on:click={() => closeWith(no)}>
        Cancel
      </Button>
    </CardActions>
  </Card>
</Dialog>
