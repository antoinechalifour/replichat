import Pusher from "pusher-js";

console.log("--------------- Client -------------");
console.log(import.meta.env);
console.log("------------------------------------");

export const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
  cluster: "eu",
});
