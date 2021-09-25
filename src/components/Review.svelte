<script>
  import {
    Card,
    CardSubtitle,
    CardText,
    CardTitle,
    Textarea,
  } from "svelte-materialify";
  import Stars from "../templates/Stars.svelte";
  export let author;
  export let rating;
  export let date;
  export let description;
</script>

<Card>
  <CardTitle>
    {author}'s review
  </CardTitle>
  <CardSubtitle>
    {new Date(date).stringFormat?.()}
  </CardSubtitle>
  <CardText>
    <Stars bind:rating clickable />
    <Textarea disabled>{description || ""}</Textarea>
  </CardText>
</Card>
