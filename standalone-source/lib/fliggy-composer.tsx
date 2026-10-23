"use client";

import { useThread, useThreadList } from "@openuidev/react-ui";
import { useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import { withBase } from "./base-path";

export function FliggyComposer() {
  const threadId = useThreadList(s => s.selectedThreadId);
  return <ComposerInput key={threadId ?? "new"} />;
}

function ComposerInput() {
  const processMessage = useThread(s => s.processMessage);
  const cancelMessage = useThread(s => s.cancelMessage);
  const running = useThread(s => s.isRunning);
  const loading = useThread(s => s.isLoadingMessages);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    if (!input.current) return;
    input.current.style.height = "24px";
    input.current.style.height = `${Math.min(120, Math.max(24, input.current.scrollHeight))}px`;
  }, [text]);
  const send = () => {
    if (!text.trim() || running || loading) return;
    const message = text.trim();
    setText("");
    setError("");
    void Promise.resolve(processMessage({ role: "user", content: message })).catch(() => {
      setText(message);
      setError("发送失败，请重试");
    });
  };
  const icon = (name: string) => <span className="fliggy-shell-icon"><img src={withBase(`/fliggy-shell/${name}.svg`)} alt="" /></span>;
  return <div className="fliggy-composer">
    <div className="fliggy-composer-input" data-drafting={!!text || undefined}>
      <button type="button" disabled title="语音暂未接入" aria-label="语音暂未接入">{icon("voice")}</button>
      <textarea ref={input} value={text} onChange={e => setText(e.target.value)} rows={1}
        placeholder="发消息..." aria-label="输入消息"
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
            e.preventDefault(); send();
          }
        }} />
      {text.trim() || running ? <button type="button" className="fliggy-composer-send"
        disabled={!running && loading} aria-label={running ? "停止生成" : "发送消息"}
        onClick={running ? cancelMessage : send}>{running ? <Square size={16} fill="currentColor" /> : <ArrowUp size={20} />}</button> :
        <div className="fliggy-composer-extras">
          <button type="button" disabled title="附件暂未接入" aria-label="附件暂未接入"><span className="fliggy-plus" /></button>
        </div>}
    </div>
    {error && <p className="fliggy-composer-note" role="alert">{error}</p>}
  </div>;
}
