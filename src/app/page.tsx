"use client";
import "@/lib/browser-crypto";
import "@/lib/devtools";
import "@openuidev/react-ui/styles/index.css";

import {
  AgentInterface,
  fetchLLM,
  openAIConversationMessageFormat,
  openAIResponsesAdapter,
} from "@openuidev/react-ui";
import type { ActionEvent } from "@openuidev/react-lang";
import { useEffect } from "react";
import { FliggyEmbedBridge } from "@/lib/fliggy-embed-bridge";
import { FliggyWelcome } from "@/lib/fliggy-welcome";
import { runLibraryAction } from "@/lib/actions";
import { withBase } from "@/lib/base-path";
import { localChatStorage, SaveMessages } from "@/lib/chat-storage";
import { webUrl } from "@/lib/components/style";
import { library } from "@/lib/library";
import { fliggyLightTheme } from "@/lib/fliggy-theme";
import { FliggyComposer } from "@/lib/fliggy-composer";
import { FliggySidebar } from "@/lib/fliggy-sidebar";
import "./fliggy-shell.css";

// The chat opens @OpenUrl with a plain window.open of whatever URL the model wrote, and on
// openui.com this page shares its origin with the rest of the site. So only http(s) URLs open,
// in a new tab without an opener; a javascript: or data: URL does nothing.
if (typeof window !== "undefined") {
  const open = window.open.bind(window);
  window.open = (url?: string | URL) => {
    const safe = webUrl(String(url ?? ""));
    return safe ? open(safe, "_blank", "noopener,noreferrer") : null;
  };
}

const llm = fetchLLM({
  url: withBase("/api/chat"),
  streamAdapter: openAIResponsesAdapter(),
  messageFormat: openAIConversationMessageFormat,
});

// Observe cancellation without replacing the existing transport or provider.
const embeddedLLM: typeof llm = {
  ...llm,
  send: (request) => {
    request.signal?.addEventListener("abort", () => window.dispatchEvent(new Event("fliggy:generation-aborted")), { once: true });
    return llm.send(request);
  },
};

// Threads and messages persist in localStorage (created once, on the client).
const storage = typeof window === "undefined" ? undefined : localChatStorage();

// The chat sends @ToAssistant and opens @OpenUrl itself; every other action,
// such as the library's @CopyToClipboard, reaches onAction.
function onAction(event: ActionEvent) {
  void runLibraryAction(event);
}

export default function Home() {
  // The chat always uses the approved light design, including embedded views.
  useEffect(() => {
    document.documentElement.setAttribute("data-openui-theme", "light");
    document.documentElement.style.colorScheme = "light";
  }, []);

  return (
    <div className="chat-shell">
      <AgentInterface
        llm={embeddedLLM}
        storage={storage}
        componentLibrary={library}
        onAction={onAction}
        agentName="Fliggy"
        logoUrl={withBase("/shiro-face.svg")}
        theme={{ mode: "light", lightTheme: fliggyLightTheme }}
      >
        <AgentInterface.Sidebar>
          <FliggySidebar />
        </AgentInterface.Sidebar>
        <AgentInterface.ThreadHeader showChatTitle={false} />
        <AgentInterface.Composer><FliggyComposer /></AgentInterface.Composer>
        <AgentInterface.Welcome className="fliggy-welcome"><FliggyWelcome /></AgentInterface.Welcome>
        <SaveMessages />
        <FliggyEmbedBridge />
      </AgentInterface>
    </div>
  );
}
