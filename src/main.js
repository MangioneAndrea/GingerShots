import App from "./App.svelte";

const app = new App({
  target: document.body,
});

Array.prototype.average = function () {
  return this.reduce((acc, el) => acc + el, 0) / this.length;
};

Array.prototype.unique = function () {
  return this.filter((value, index) => this.indexOf(value) === index);
};

Date.prototype.stringFormat = function () {
  return new Intl.DateTimeFormat("ch").format(this);
};
export default app;
