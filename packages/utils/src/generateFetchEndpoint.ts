export function generateFetchEndpoint(host: string) {
  const protocol = host === "db.localtest.me" ? "http" : "https";
  const port = host === "db.localtest.me" ? 4444 : 443;
  return `${protocol}://${host}:${port}/sql`;
}
