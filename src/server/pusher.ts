import Pusher from "pusher";
import { channelForUser } from "~/shared/Pusher";

export const pusher = new Pusher({
  appId: import.meta.env.VITE_PUSHER_APP_ID,
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  secret: import.meta.env.VITE_PUSHER_APP_SECRET,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  useTLS: true,
});

export function poke(userId: string) {
  pusher.trigger(channelForUser(userId), "poke", {});
}
