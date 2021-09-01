<script>
  import ShotDialog from "../components/ShotDialog.svelte";
  import Stars from "../templates/Stars.svelte";
  import { getShots } from "../services/firebase-firestore";
  import "gridjs/dist/theme/mermaid.css";
  import Table from "../templates/Table.svelte";
  import { Button, Icon } from "svelte-materialify";
  import { mdiPlus } from "@mdi/js";
  let shot;
  let open = false;

  const openShotDialog = (r) => {
    shot = r;
    open = true;
  };

  let shots = [];
  const refresh = async () => {
    shots = await getShots();
  };
  refresh();
</script>

<div class="container">
  <Table
    data={shots}
    columns={[
      { name: "Author", value: "author" },
      {
        name: "Date",
        value: "date",
        formatter: (val) => new Date(val).stringFormat(),
      },
      {
        name: "Ingredients",
        value: "ingredients",
        formatter: (arr) => arr.join(", "),
      },
      {
        name: "Rating",
        value: "rating",
        renderer: { component: Stars },
      },
    ]}
    onRowClick={openShotDialog}
  />
  <Button
    fab
    size="large"
    class="green white-text"
    on:click={() => openShotDialog({})}
  >
    <Icon path={mdiPlus} />
  </Button>
</div>
{#if open}
  <ShotDialog bind:shot bind:open onSave={refresh} />
{/if}

<style type="text/scss">
  div.container {
    position: relative;
    width: 100%;
    height: 100%;
    :global(div.container.table) {
      width: calc(100% - 160px);
      margin: 80px;
      margin-top: 14px;
      @media only screen and (max-width: 768px) {
        width: calc(100% - 16px);
        margin: 8px;
      }
    }
    :global(button.s-btn--fab) {
      position: fixed;
      bottom: 40px;
      right: 40px;
      @media only screen and (max-width: 768px) {
        bottom: 8px;
        right: 8px;
        margin: 8px;
      }
    }
  }
</style>
