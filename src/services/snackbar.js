import { writable } from "svelte/store";

export const snacks = writable([]);

export const pushSnacks = (message, duration = 3000) => {
  const snack = {
    message,
    duration,
    eta: Date.now(),
    close: function () {
      console.log(this);
      snacks.update((arr) => arr.filter((el) => el != this));
    },
  };
  snacks.update((arr) => [...arr, snack]);
};

setInterval(() => {
  const now = Date.now();
  snacks.update((arr) =>
    arr.filter(({ eta, duration }) => now - eta < duration)
  );
}, 200);

window.pushSnacks = pushSnacks;
