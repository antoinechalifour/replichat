import { prisma, runTransaction } from "~/server/prisma";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { updateChat } from "~/server/chats/UpdateChat";
import { poke } from "~/server/pusher";

export async function generateChatName(userId: string, chatId: string) {
  const chat = await prisma.chat.findFirstOrThrow({
    where: { id: chatId },
    include: {
      user: true,
      messages: { orderBy: { createdAt: "asc" }, take: 1 },
    },
  });
  const message = chat.messages[0];
  const apiKey = chat.user.openAiApiKey;
  if (message == null || apiKey == null) return;
  const openai = createOpenAI({ apiKey: apiKey });

  const response = await generateText({
    model: openai("gpt-4o-mini"),
    messages: [
      {
        role: "system",
        content: `Generate a chat title based on the following message: "${message.content}". The title should be short (3-4 words) and descriptive. Not quotes, no markdown, just plain text`,
      },
    ],
  });

  await runTransaction(() =>
    updateChat.execute({
      id: chatId,
      userId,
      updates: { title: response.text },
    }),
  );

  poke(userId);
}
