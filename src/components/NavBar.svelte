<script>
  import {
    Button,
    Icon,
    AppBar,
    Divider,
    Tabs,
    Tab,
    Menu,
  } from "svelte-materialify";
  import {
    mdiThemeLightDark,
    mdiViewDashboard,
    mdiClipboardList,
    mdiAccount,
  } from "@mdi/js";
  import Home from "../routes/Home.svelte";
  import List from "../routes/List.svelte";
  import { user, logout } from "../services/firebase-auth";
  import Account from "../routes/Account.svelte";

  export let page;
  export let theme;
  export let loggingIn;
  export let dialogOpts;

  $: tabs = [
    { icon: mdiViewDashboard, link: Home },
    { icon: mdiClipboardList, link: List },
    { icon: mdiAccount, link: Account, disabled: !$user },
  ];

  const switchTheme = () => {
    theme = theme === "light" ? "dark" : "light";
  };

  const changePage = (evt) => {
    page = tabs[evt.detail]?.link || Home;
  };
  const login = () => {
    loggingIn = true;
  };

  const openLogout = () => {
    dialogOpts = {
      open: true,
      yes: logout,
      title: "Logout",
      text: "Do you really want to logout?",
    };
  };
</script>

<AppBar dense>
  <span slot="title">Ginger shots</span>
  <div class="separator" />
  <div class="tabs">
    <Tabs centered fixedTabs on:change={changePage}>
      <div slot="tabs">
        {#each tabs as tab}
          <Tab disabled={tab.disabled}><Icon path={tab.icon} /></Tab>
        {/each}
      </div>
    </Tabs>
  </div>
  <Divider vertical />
  <div class="staticButtons">
    <Menu closeOnClick={false}>
      <div slot="activator">
        {#if !!$user}
          <Button class="topBarRightButtons" depressed on:click={openLogout}>
            Logout
          </Button>
        {:else}
          <Button class="topBarRightButtons" depressed on:click={login}>
            Login
          </Button>
        {/if}
      </div>
    </Menu>
    <Button class="topBarRightButtons" icon on:click={switchTheme}>
      <Icon path={mdiThemeLightDark} />
    </Button>
  </div>
</AppBar>

<style type="text/scss">
  .tabs {
    margin: auto;
    @media only screen and (max-width: 768px) {
      margin: 0;
      flex: 1;
    }
  }
  .staticButtons {
    padding: 10px;
    @media only screen and (max-width: 768px) {
      padding: 0;
    }
    :global(button.topBarRightButtons.size-default) {
      margin: auto;
      @media only screen and (max-width: 768px) {
        padding: 0 8px;
      }
    }
  }
  span {
    @media only screen and (max-width: 768px) {
      display: none;
    }
  }
  .separator {
    flex-grow: 1;
    @media only screen and (max-width: 768px) {
      flex-grow: 0;
      display: none;
    }
  }
</style>
