import type { Readable, Stream } from "stream";

const decoder = new TextDecoder();

async function streamToString(stream: Stream): Promise<string> {
  const chunks: Uint8Array[] = [];

  return await new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

export async function readJSONBody(
  body: ReadableStream | Buffer
): Promise<Record<string, unknown> | undefined> {
  try {
    if ("getReader" in body) {
      const reader = body.getReader();
      const bytes: number[] = [];

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();

        if (done) break;
        bytes.push(...value);
      }

      const b = new Uint8Array(bytes);

      return JSON.parse(decoder.decode(b));
    }

    // node-fetch
    if (typeof Buffer !== "undefined" && Buffer.isBuffer(body)) {
      return JSON.parse(body.toString("utf8"));
    }

    return JSON.parse(await streamToString(body as unknown as Readable));
  } catch (e) {
    console.error(e);
  }
}
