export type SendRequest = {type: 'fliggy:send'; requestId: string; text: string; newChat: boolean};
export function validSend(value: unknown): value is SendRequest {
  if (!value || typeof value !== 'object') return false;
  const v=value as SendRequest;
  return v.type==='fliggy:send' && typeof v.requestId==='string' && /^[\w-]{1,128}$/.test(v.requestId) && typeof v.text==='string' && v.text.trim().length>0 && v.text.length<=5000 && typeof v.newChat==='boolean';
}
export function trustedParent(origin: string, source: unknown, parent: unknown, allowed: readonly string[]) {
 return source===parent && allowed.includes(origin);
}
