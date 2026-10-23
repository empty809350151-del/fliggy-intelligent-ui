"use client";

import { AgentInterface, useThreadList } from "@openuidev/react-ui";
import { SquarePen } from "lucide-react";

export function FliggySidebar() {
  const switchToNewThread = useThreadList(s => s.switchToNewThread);
  return <>
    <AgentInterface.SidebarHeader className="fliggy-sidebar-header" agentName="" />
    <AgentInterface.SidebarContent>
      <h2 className="fliggy-history-title">历史对话</h2>
      <AgentInterface.ThreadList />
    </AgentInterface.SidebarContent>
    <div className="fliggy-sidebar-bottom">
      <button type="button" className="fliggy-new-chat" onClick={() => switchToNewThread()}>
        <SquarePen size={18} aria-hidden="true" />新聊天
      </button>
    </div>
  </>;
}
