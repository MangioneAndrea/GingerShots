<script>
    import {
        Button,
        Card,
        CardActions,
        CardSubtitle,
        CardText,
        CardTitle,
        Dialog,
        TextField,
    } from "svelte-materialify";
    import { magicLogin } from "../services/firebase";
    export let open = false;
    export let email = "";
    const loginAndClose = async () => {
        magicLogin(email);
        open = false;
    };
</script>

<Dialog bind:active={open}>
    <Card raised >
        <CardTitle>Magic Login</CardTitle>
        <CardSubtitle>
            An email with a login link will be sent. So no passwords are needed!
        </CardSubtitle>
        <br />
        <CardText>
            <TextField bind:value={email}>Email</TextField>
        </CardText>
        <CardActions>
            <Button text class="primary-text" on:click={loginAndClose}>
                Send email
            </Button>
        </CardActions>
    </Card>
</Dialog>

<style type="text/scss">
</style>
