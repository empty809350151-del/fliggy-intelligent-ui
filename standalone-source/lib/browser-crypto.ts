// randomUUID requires a secure context; getRandomValues also works on LAN HTTP.
// OpenUI calls randomUUID during initialization and when creating messages.
export function installRandomUUID(cryptoApi: Crypto): void {
  if (typeof cryptoApi.randomUUID === "function") return;
  cryptoApi.randomUUID = () => {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  };
}

if (typeof window !== "undefined") installRandomUUID(window.crypto);
