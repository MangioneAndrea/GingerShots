<script>
	import { MaterialAppMin } from "svelte-materialify";
	import NavBar from "./components/NavBar.svelte";
	import Home from "./routes/Home.svelte";

	let page = Home;
	let theme = localStorage.getItem("theme") || "light";
	$: {
		if (theme) {
			localStorage.setItem("theme", theme);
		}
	}
</script>

<MaterialAppMin {theme}>
	<NavBar bind:page bind:theme />
	<svelte:component this={page} />
</MaterialAppMin>

<style>
	:global(body) {
		padding: 0;
	}
</style>
