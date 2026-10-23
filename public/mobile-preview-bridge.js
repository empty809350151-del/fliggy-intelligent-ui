// The preview relays messages only between its configured parent and its own app.
(async () => {
  if (window.parent === window) return;
  document.documentElement.classList.add('embedded');
  const frame = document.querySelector('iframe');
  const appOrigin = location.origin;
  let parentOrigin = null;
  let allowed;
  try {
    const response = await fetch('./embed-parent-origins.json', {cache: 'no-store'});
    if (!response.ok) return;
    allowed = await response.json();
    if (!Array.isArray(allowed)) return;
  } catch { return; }
  const replies = new Set(['fliggy:ready', 'fliggy:accepted', 'fliggy:completed', 'fliggy:error']);
  window.addEventListener('message', event => {
    const message = event.data;
    if (!message || typeof message !== 'object') return;
    if (event.source === window.parent && allowed.includes(event.origin)) {
      if (message.type !== 'fliggy:hello' && message.type !== 'fliggy:send') return;
      if (parentOrigin && parentOrigin !== event.origin) return;
      parentOrigin = event.origin;
      frame.contentWindow.postMessage(message, appOrigin);
    } else if (event.source === frame.contentWindow && event.origin === appOrigin && parentOrigin && replies.has(message.type)) {
      window.parent.postMessage(message, parentOrigin);
    }
  });
})();
