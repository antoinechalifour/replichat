import Pusher from "pusher";
import { channelForUser } from "~/shared/Pusher";

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.VITE_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.PUSHER_APP_CLUSTER!,
  useTLS: true,
});

export function poke(userId: string) {
  console.log("[Pusher] Poke user", { userId });
  void pusher.trigger(channelForUser(userId), "poke", {}).catch((err) => {
    console.error("Error triggering Pusher event:", err);
  });
}
