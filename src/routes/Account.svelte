<script>
  import {
    Button,
    Card,
    CardText,
    CardTitle,
    Col,
    Row,
    TextField,
  } from "svelte-materialify";
  import { user } from "../services/firebase-auth";
  import { updateUser, getUser } from "../services/firebase-firestore";

  let nickname;

  getUser().then((user) => {
    nickname = user.nickname;
  });

  const changeNick = () => {
    updateUser({ nickname });
  };
</script>

<div class="container">
  <Card outlined class="card">
    <CardTitle class="centered">Account settings</CardTitle>
    <CardText>
      <Row>
        <Col><div class="text-overline">Email</div></Col>
        <Col>
          <TextField disabled>
            {$user?.email}
          </TextField>
        </Col>
      </Row>
      <Row>
        <Col>
          <div class="text-overline">nickname</div>
        </Col>
        <Col>
          <TextField
            placeholder="Nick"
            bind:value={nickname}
            on:change={changeNick}
          />
        </Col>
      </Row>
      <Row class="centered">
        <!--<Button class="red white-text">Delete account</Button>-->
      </Row>
    </CardText>
  </Card>
</div>

<style type="text/scss">
  div.container {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 15px;

    :global(.card) {
      width: 50%;
      @media only screen and (max-width: 768px) {
        width: calc(100% - 16px);
        margin: 8px;
        :global(.s-col) {
          flex-basis: unset;
        }
      }
      margin: auto;
      :global(.centered) {
        justify-content: center;
      }
    }
  }
</style>
