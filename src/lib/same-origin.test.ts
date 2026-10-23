import { afterEach, describe, expect, it, vi } from "vitest";
import { hasAllowedOrigin } from "./same-origin";
afterEach(() => vi.unstubAllEnvs());
const request = (headers: Record<string, string> = {}) => new Request("http://localhost:3200/api/chat", { headers: { host: "127.0.0.1:3200", origin: "http://127.0.0.1", referer: "http://127.0.0.1:3200/", "sec-fetch-site": "same-origin", ...headers } });
describe("local origin validation", () => {
  it("accepts ordinary exact origins", () => { expect(hasAllowedOrigin(request({origin:"http://127.0.0.1:3200"}))).toBe(true); });
  it("accepts a stripped loopback port only during development", () => { vi.stubEnv("NODE_ENV", "development"); expect(hasAllowedOrigin(request())).toBe(true); });
  it("rejects the compatibility case in production", () => { vi.stubEnv("NODE_ENV", "production"); expect(hasAllowedOrigin(request())).toBe(false); });
  it.each([{referer:"http://127.0.0.1:9999/"}, {"sec-fetch-site":"cross-site"}, {referer:""}, {origin:"null"}, {origin:""}, {origin:"https://example.com"}, {origin:"http://127.0.0.1:9999"}])("rejects mismatched or missing evidence %j", (headers) => { vi.stubEnv("NODE_ENV", "development"); expect(hasAllowedOrigin(request(headers))).toBe(false); });
});
