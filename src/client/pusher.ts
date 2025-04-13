import Pusher from "pusher-js";

export const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
  cluster: "eu",
});
