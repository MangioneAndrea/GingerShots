<script>
  import {
    Card,
    CardSubtitle,
    CardText,
    CardTitle,
    Textarea,
  } from "svelte-materialify";
  import Stars from "../templates/Stars.svelte";
  import { user } from "../services/firebase-auth";
  import { updateReview } from "../models/review";
  import { pushSnacks } from "../services/snackbar";
  export let author;
  export let authorId;
  export let rating = 0;
  export let date;
  export let description = "";
  export let shot;

  const isCurrentUser = $user.uid === authorId;

  const changeReview = async () => {
    try {
      await updateReview(shot, { rating, date, description });
    } catch (err) {
      pushSnacks(err.message);
    }
  };
</script>

<Card>
  <CardTitle>
    {author}'s review
  </CardTitle>
  <CardSubtitle>
    {new Date(date).stringFormat?.()}
  </CardSubtitle>
  <CardText>
    <Stars bind:rating clickable={isCurrentUser} />
    <Textarea
      bind:value={description}
      disabled={!isCurrentUser}
      on:change={changeReview}
    />
  </CardText>
</Card>
