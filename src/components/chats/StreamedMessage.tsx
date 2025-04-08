import Markdown from "react-markdown";
import { useQuery } from "@tanstack/react-query";
import { experimental_streamedQuery as streamedQuery } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { Icon } from "~/components/Icon";

async function* generate(chatId: string) {
  const response = await fetch(`/api/chats/${chatId}/generate`, {
    method: "POST",
  });

  if (response.body == null) return;
  const decoder = new TextDecoder("utf-8");

  // @ts-expect-error response.body is an async iterable
  for await (const chunk of response.body) {
    const part = decoder.decode(chunk, { stream: true });
    yield part;
  }
  // Flush any remaining bytes
  yield decoder.decode();
}

export function StreamedMessage({
  chatId,
  messageId,
}: {
  chatId: string;
  messageId: string;
}) {
  const { data: message } = useQuery({
    queryKey: ["chat", chatId, "message", messageId],
    queryFn: streamedQuery({
      queryFn: () => generate(chatId),
    }),
  });

  return (
    <div>
      {message == null ? (
        <Icon as={LoaderIcon} className="animate-spin text-gray-500" />
      ) : (
        <Markdown>{message.join("")}</Markdown>
      )}
    </div>
  );
}
