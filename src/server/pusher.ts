import Pusher from "pusher";
import { channelForUser } from "~/shared/Pusher";

console.log("-------------------------");
console.log(process.env);
console.log("-------------------------");
export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.VITE_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.PUSHER_APP_CLUSTER!,
  useTLS: true,
});

export function poke(userId: string) {
  pusher.trigger(channelForUser(userId), "poke", {});
}
