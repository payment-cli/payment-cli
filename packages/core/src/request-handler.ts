import { z } from "zod";
import type { TrieRouter } from "@rccpr/trie-router";
import { RccprHandler, ResponseInternal } from "./internal.types";
import { readJSONBody } from "./http.helpers";
import { parse as parseCookie, serialize } from "cookie";
import { SupportedHTTPMethod } from "./constants";

const isSupportedHTTPMethod = (method: string): method is SupportedHTTPMethod =>
  z.nativeEnum(SupportedHTTPMethod).safeParse(method).success;

const requestToInternalResponse = async (
  router: TrieRouter<RccprHandler>,
  req: Request,
  basePath?: string
): Promise<ResponseInternal> => {
  const url = new URL(req.url.replace(/\/$/, ""));
  const { pathname } = url;

  if (!isSupportedHTTPMethod(req.method)) {
    throw new Error(`Unsupported HTTP method: ${req.method}`);
  }

  const method = req.method;

  const finalPathname = basePath ? pathname.replace(basePath, "") : pathname;
  console.log({ pathname, finalPathname, method });

  const [match] = router.match(method, finalPathname);
  console.log({ match });
  if (match.length === 0) {
    throw new Error(`No handler found for ${method} ${finalPathname}`);
  }

  const [handler, params] = match[0];
  const internal = {
    url,
    method,
    headers: Object.fromEntries(req.headers as any),
    body: req.body ? await readJSONBody(req.body) : undefined,
    cookies: parseCookie(req.headers.get("cookie") ?? "") ?? {},
    error: url.searchParams.get("error") ?? undefined,
    query: Object.fromEntries(url.searchParams),
  };

  return handler({
    req: internal,
    params,
    originalRequest: req,
  });
};

const toResponse = (res: ResponseInternal): Response => {
  const headers = new Headers(res.headers);

  res.cookies?.forEach((cookie) => {
    const { name, value, options } = cookie;
    const cookieHeader = serialize(name, value, options);

    if (headers.has("Set-Cookie")) {
      headers.append("Set-Cookie", cookieHeader);
    } else {
      headers.set("Set-Cookie", cookieHeader);
    }
  });

  const body =
    headers.get("content-type") === "application/json"
      ? JSON.stringify(res.body)
      : res.body;

  const response = new Response(body, {
    headers,
    status: res.redirect ? 302 : (res.status ?? 200),
  });

  if (res.redirect) {
    response.headers.set("Location", res.redirect);
  }

  return response;
};

export const processRequest = async (
  router: TrieRouter<RccprHandler>,
  request: Request,
  basePath?: string
): Promise<Response> => {
  try {
    const internalResponse = await requestToInternalResponse(
      router,
      request,
      basePath
    );
    return toResponse(internalResponse);
  } catch (error) {
    return new Response(
      `Error: There was an error while processing your request.`,
      { status: 400 }
    );
  }
};
