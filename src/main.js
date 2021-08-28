import App from './App.svelte';

const app = new App({
	target: document.body,
});

Array.prototype.average = function () {
	return this.reduce((acc, el) => acc + el, 0) / this.length
}

export default app;