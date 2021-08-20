<script>
  import { Button, Icon, AppBar, Divider, Tabs, Tab } from "svelte-materialify";
  import {
    mdiThemeLightDark,
    mdiViewDashboard,
    mdiStar,
    mdiClipboardList,
  } from "@mdi/js";
  import Home from "../routes/Home.svelte";
  import List from "../routes/List.svelte";
  import Reviews from "../routes/Reviews.svelte";

  export let page;
  export let theme;

  const tabs = [
    { icon: mdiViewDashboard, link: Home },
    { icon: mdiClipboardList, link: List },
    { icon: mdiStar, link: Reviews },
  ];

  const switchTheme = () => {
    theme = theme === "light" ? "dark" : "light";
  };

  const changePage = (evt) => {
    page = tabs[evt.detail]?.link || "home";
  };
</script>

<AppBar dense>
  <span slot="title">Ginger shots</span>
  <div style="flex-grow:1" />
  <div class="tabs">
    <Tabs centered fixedTabs on:change={changePage}>
      <div slot="tabs">
        {#each tabs as tab}
          <Tab><Icon path={tab.icon} /></Tab>
        {/each}
      </div>
    </Tabs>
  </div>
  <Divider vertical />
  <div class="staticButtons">
    <Button class="topBarRightButtons" depressed on:click={switchTheme}
      >Login</Button
    >
    <Button class="topBarRightButtons" icon on:click={switchTheme}>
      <Icon path={mdiThemeLightDark} />
    </Button>
  </div>
</AppBar>

<style type="text/scss">
  .tabs {
    margin: auto;
  }
  .staticButtons {
    padding: 10px;
    :global(.topBarRightButtons) {
      margin: auto;
    }
  }
</style>
