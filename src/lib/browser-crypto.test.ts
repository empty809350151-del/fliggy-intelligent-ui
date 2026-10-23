import { describe, expect, it, vi } from "vitest";
import { installRandomUUID } from "./browser-crypto";

describe("LAN HTTP UUID compatibility", () => {
  it("preserves a native randomUUID implementation", () => {
    const native = vi.fn();
    const api = { randomUUID: native } as unknown as Crypto;
    installRandomUUID(api);
    expect(api.randomUUID).toBe(native);
  });

  it("creates RFC 4122 version 4 IDs from secure random bytes when randomUUID is absent", () => {
    const getRandomValues = vi.fn((bytes: Uint8Array) => {
      bytes.fill(255);
      return bytes;
    });
    const api = { getRandomValues } as unknown as Crypto;
    installRandomUUID(api);
    expect(api.randomUUID()).toBe("ffffffff-ffff-4fff-bfff-ffffffffffff");
    expect(getRandomValues).toHaveBeenCalledOnce();
  });
});
