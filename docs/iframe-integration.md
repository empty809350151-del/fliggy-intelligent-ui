# 外层 HTML 与飞猪帮帮桥接

## 配置

- 宿主地址配置：`../output/merged-framework-source/embed-config.json`，URL 指向完整首页。
- 父来源白名单：`NEXT_PUBLIC_EMBED_PARENT_ORIGINS`，默认 `http://127.0.0.1:8767`。仅允许明确的 HTTP(S) origin；部署后更改需重新构建。
- 宿主服务仅静态托管，模型调用与凭据仍由本项目已有 `/api/chat` 处理。

## 协议

1. 父页面每 500ms 发 `fliggy:hello`，子应用聊天状态初始化后回 `fliggy:ready`（含 busy）。load 事件只启动握手。
2. 父发 `{type:'fliggy:send',requestId,text,newChat}`，子回 accepted，再回 completed 或 error。请求相关事件均带 requestId。
3. 子项目每个加载生命周期保留最多1000个请求ID及结果。同ID只重放状态，不重新生成；达到上限拒绝新请求，不驱逐旧ID。
4. 生成失败后父保留输入，以新ID重试。接收确认/生成超时后须检查聊天再重载，不自动重复发起模型调用。
5. 双方严格检查 origin/source；子端复用 switchToNewThread/processMessage，并读取 threadError 和取消信号，不能仅凭 processMessage Promise resolve 认定成功。

## 验证

已通过类型检查、协议与控制器测试（来源拒绝、格式校验、新建/继续、并发拒绝、去重、失败后新ID重试），以及宿主DOM回归检查。

2026-10-21：浏览器自动化访问指定 LAN 首页报 ERR_BLOCKED_BY_CLIENT，因此未能完成该环境下真实 iframe、模型生成及生成组件点击的端到端验收。不能将单元测试称为真实模型验证。

浏览器允许加载目标地址后，人工验收：外层选择自定义需求→等待就绪→新建对话发送预算工具需求→确认右侧真实生成及数值控件联动→选择继续当前对话再提修改需求→确认仍在同一历史会话→在聊天中停止生成确认外层失败反馈。还应检查历史/新聊天功能及窄屏面板。

## 2026-10-21：移动预览地址

按用户最新要求，外层地址改为 `http://localhost:3100/mobile-preview.html`。
预览页通过 `public/mobile-preview-bridge.js` 将已校验的消息转发到同源聊天 iframe，再将 ready/accepted/completed/error 原样回传；请求去重仍由聊天应用控制。
`public/embed-parent-origins.json` 配置预览页允许的外层来源，也作为聊天桥接的默认来源列表。聊天桥接额外允许同源直接父窗口，以支持预览壳。
嵌入时隐藏预览页标题和留白，使聊天填满外层 390 × 844 容器；独立打开时保留预览布局。
实测 localhost 已完成 ready/accepted，外层问题进入真实聊天并生成小城推荐内容。来源校验与转发单测通过。

## 自定义需求的关联连线

`fliggy:completed` 增加 `output`（本次 assistant 内容，最多 100000 字符），只沿已校验来源的消息桥回传，不执行该文本。
外层用提示词规则生成需求类型与策略示意；完成后以返回内容中的组件标识识别资产，绘制到 iframe 的连线。未关联节点隐藏。规则推导不声称是模型隐藏推理记录；资产名称识别不等于交互验证。

## 2026-10-21：证据驱动的自定义路径（替代名称正则识别）

- fliggy:completed 携带 evidence v1，由同一 OpenUI library schema 的正式 parser 解析本次 assistant 内容。
- 只采集有效程序根节点可达的 ElementNode（组件名、节点路径、动态标记）。孤立声明、正文里的组件名称不计入资产。解析失败不创建实现连线。
- 输入类型独立由原提示词规则归纳，记录命中的原文；不会因输出出现图片而添加用户未提出的外观需求。未知需求保持未分类。
- 生成前只有输入到类型的待验证连线。完成后显示有程序依据的资产，并保留无后续依据的需求类型。
- 组织/图文/媒介策略为结构归纳；仅凭控件出现不能确认计算、状态变化、学习反馈、格式规范或请求边界，因此这些策略暂不生成已体现路径。
- 节点点击可查看依据。所有结构关联都不代表语义覆盖、渲染成功或运行效果验证；状态/动作的端到端验证仍明确待验证。
- 验证：parser 反例（正文误命中、孤立组件、非法程序）、需求保留、无提前实现连线、真实组件名、通用/OTA 回归。

## 通用与 OTA 输出入口统一

通用、OTA 共 20 个输出卡片现在点击即打开真实 Fliggy 移动预览 iframe，完成 ready 握手后以该场景 `request` 新建对话并发送。不再跳转旧 results 静态示例。输出浮层显示加载、发送、生成、完成、错误状态；关闭清理监听状态与计时器。地址复用 embed-config.json。
这两个场景的中间桑基图仍为预设设计参考，并非本次生成的实测决策记录，完成提示明确说明。
新增场景握手测试覆盖两种场景、原始提示词、精确来源、重复 ready、错误 requestId、完成及关闭清理。

## 固定场景输出（取代场景实时生成）

通用和 OTA 场景各 10 项，预生成结果保存于 `public/scenario-examples/{scene}-{id}.json`。`scripts/scenarios/inputs.json` 保留原始场景需求；`scripts/scenarios/generate.mjs` 使用本项目现有接口生成并通过 library schema 检查，支持已完成文件复用。
外层点击只加载 `/examples/{scene}-{id}`，由同一 Fliggy library 的 Renderer 展示已保存程序，没有模型发送消息或聊天请求。组件本地状态仍可交互；不提供继续模型追问。自定义需求仍保留实时生成。
已实测 generic-explore 的博物馆筛选，结果从 12 处变为 2 处。
