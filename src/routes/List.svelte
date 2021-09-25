<script>
  import ShotDialog from "../components/ShotDialog.svelte";
  import Reviews from "../components/Reviews.svelte";
  import Stars from "../templates/Stars.svelte";
  import { getShots } from "../models/shot";
  import "gridjs/dist/theme/mermaid.css";
  import Table from "../templates/Table.svelte";
  import { Button, Icon } from "svelte-materialify";
  import { mdiPlus } from "@mdi/js";
  import { user } from "../services/firebase-auth";
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
      { name: "Author", value: "author", sortable: true },
      {
        name: "Date",
        field: "date",
        sortable: true,
        formatter: (val) => new Date(val).stringFormat(),
        sortValueGetter: (val) => new Date(val).getTime(),
      },
      {
        name: "Ingredients",
        field: "ingredients",
        sortable: true,
        formatter: (arr) => arr.join(", "),
      },
      {
        name: "Rating",
        field: "rating",
        sortable: true,
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
  {#if Object.keys(shot).length === 0 || (shot?.authorId && $user?.uid === shot?.authorId)}
    <ShotDialog bind:shot bind:open onSave={refresh} />
  {:else}
    <Reviews bind:shot bind:open onSave={refresh} />
  {/if}
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
