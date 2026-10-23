"use client";

import { useState } from "react";
import { useThread } from "@openuidev/react-ui";
import { withBase } from "./base-path";

const categories = [
  { label: "帮我想", questions: ["百元以内杭州可以飞哪儿", "杭州到北京的机票哪天更便宜", "问问国航会员助手"] },
  { label: "帮我订", questions: ["帮我比较杭州到北京的机票", "帮我挑选西湖附近的酒店", "帮我规划周末出游的预订清单"] },
  { label: "帮我办", questions: ["帮我看懂机票退改规则", "出发前需要准备哪些证件", "帮我整理酒店入住注意事项"] },
];

export function FliggyWelcome() {
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState("");
  const processMessage = useThread(s => s.processMessage);
  const running = useThread(s => s.isRunning);
  const loading = useThread(s => s.isLoadingMessages);
  const send = (content: string) => {
    if (running || loading) return;
    setError("");
    void Promise.resolve(processMessage({ role: "user", content })).catch(() => setError("发送失败，请重试"));
  };
  return <>
    <div className="fliggy-welcome-intro">
      <img className="fliggy-welcome-pig" src={withBase("/fliggy-shell/welcome-pig.png")} alt="飞猪旅行助手" />
      <h1>我是你的7x24小时<br />智能旅行助手</h1>
    </div>
    <div className="fliggy-welcome-suggestions">
      <div className="fliggy-welcome-tabs" aria-label="旅行助手分类">
        {categories.map((category, index) => <button key={category.label} type="button"
          aria-pressed={selected === index} onClick={() => setSelected(index)}>{category.label}</button>)}
      </div>
      <div className="fliggy-welcome-queries">
        {categories[selected].questions.map(question => <button key={question} type="button"
          disabled={running || loading} onClick={() => send(question)}>
          <span className="fliggy-query-star"><img src={withBase("/fliggy-shell/query-star.svg")} alt="" /></span>
          <span>{question}</span>
        </button>)}
      </div>
      {error && <p role="alert">{error}</p>}
    </div>
  </>;
}
