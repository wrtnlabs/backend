import http from "http";
import stream from "stream";

export namespace StreamUtil {
  export const incomingToReadable = (
    incoming: http.IncomingMessage,
  ): ReadableStream<Uint8Array> =>
    iteratorToStream(readableToIterator(incoming));
}

const iteratorToStream = (it: AsyncIterableIterator<Buffer>): ReadableStream =>
  new ReadableStream({
    pull: async (controller) => {
      const { value, done } = await it.next();
      if (done) controller.close();
      else controller.enqueue(new Uint8Array(value));
    },
  });
const readableToIterator = async function* (stream: stream.Readable) {
  for await (const chunk of stream) {
    yield chunk;
  }
};
