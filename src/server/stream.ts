export function streamTextResponse(stream: ReadableStream) {
  return new Response(stream.pipeThrough(new TextEncoderStream()), {
    status: 200,
    headers: {
      contentType: "text/plain; charset=utf-8",
    },
  });
}

export function asyncIterableToReadableStream<T>(iterable: AsyncIterable<T>) {
  return new ReadableStream({
    async pull(controller) {
      try {
        for await (const chunk of iterable) {
          controller.enqueue(chunk);
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });
}
