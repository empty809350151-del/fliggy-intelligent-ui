# open ui-fliggy 文件与执行链路说明

核对日期：2026-10-22。依据当前本地源码静态阅读，不代表已实测每项能力。未读取或展示密钥。

## 先读这条主线

用户输入 → src/lib/fliggy-composer.tsx 的 processMessage → src/app/page.tsx 配置的 fetchLLM → POST /api/chat → src/app/api/chat/route.ts → 模型 → SSE 回传 → OpenUI 解析/运行时 → library.ts 注册的 React 组件 → 用户操作与状态更新 → chat-storage.tsx 保存。

## 两个不同的阶段

### 开发准备阶段

components/*.tsx 定义组件名字、参数 Schema 和 React 实现；functions/ 定义计算函数；actions.ts 定义自定义动作。library.ts 将它们注册在一起。npm run generate 由库导出 src/generated/spec.json。npm run prompt 导出两个可阅读提示词文件。组件规范改变后需同步生成规范，避免模型看到旧说明、前端运行新组件。

### 用户使用阶段

1. layout.tsx 加载页面外壳；page.tsx 组装聊天组件、主题、组件库、存储和桥接。输入区、欢迎页和历史侧栏分别来自 fliggy-composer/welcome/sidebar。
2. 用户输入交给 OpenUI 的 processMessage。page.tsx 的消息格式适配器和 fetchLLM 负责向 /api/chat 发送对话。
3. route.ts 验证来源/请求体，保留用户与助手文本，最多取最后 60 项。系统指令由服务端提供，不能由浏览器消息冒充。
4. route.ts 在模块初始化时依据环境配置选择模型后端，用 spec.json 与 prompt-options.ts 生成指令；不是每次按需求检索组件。请求时加入当前对话。LLM_BASE_URL 优先，其次 Ollama，再否则 Gateway。本文不确认当前实际环境选中了哪个后端。
5. 直连/Ollama 使用 Chat Completions，asResponsesEvents 把增量文字转成 Responses 风格事件；Gateway 走 Responses。最终以 SSE 回传浏览器。
6. page.tsx 中的 openAIResponsesAdapter 消费响应。OpenUI SDK 承担解析、表达式求值、变量管理和 React 渲染。库文件提供可调用的实际组件。
7. 用户修改输入触发状态更新，依赖值重新求值。Set/Reset 等内置动作由运行时处理；ToAssistant 经聊天层发起下一轮；CopyToClipboard 交给 actions.ts。
8. SaveMessages 在不生成时把消息保存到 localStorage。状态由聊天 SDK 写入消息后随消息保存。不是服务端订单数据库。
9. 若界面包含搜索图片/地图路线，再按需调用 wiki、image-search、street-route；普通预算不会因此必然请求这些接口。

## 容易混淆的文件

- spec.json 是当前聊天后端实际导入的规范；system-prompt.txt 是导出物，route.ts 并不直接读取它。
- prompt-options.ts 是模型行为指导；CSS 是真实视觉实现，两者互补。
- AGENTS.md 是开发代理的项目规则，不是自动发送给终端聊天模型的指令。
- 普通聊天未注册真实机票酒店订单工具。demo-data.ts 用于演示工具配置。
- gallery 是手写程序展示；examples 是已保存程序展示；preview 是脚本检查页面，都不等同实时聊天。
- scripts/scenarios/generate.mjs 为部分场景追加专门要求；因此固定改期案例的滑块行为不能仅归因于普通聊天的 prompt-options.ts。
- QoderWork、独立查看器与普通 Next 聊天有不同入口，不能混作一条执行流程。

## 外部依赖负责什么

锁文件版本：@openuidev/lang-core 1.0.0（协议解析、提示词构造等核心能力）；@openuidev/react-lang 1.0.0（组件库、Renderer 等 React 接口）；@openuidev/react-ui 0.18.1（AgentInterface、聊天状态和请求适配接口）。React 实际更新 DOM；Next 提供页面和服务端路由。不是本项目自行实现了全部协议引擎。

## 文件清单

下面逐个列出主源码、配置、脚本、集成、部署和静态资源。构建缓存、安装依赖和分发副本在后面说明，不逐个展开其中的库文件。角色说明来自关键入口和模块核对；测试/样式/静态资产按文件职责归类，并非对每个文件作完整代码审计。



### 根目录

| 文件 | 作用 |
|---|---|
| [.env.example](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/.env.example>) | 模型及可选能力的环境配置示例。 |
| [.gitignore](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/.gitignore>) | 不纳入版本管理的文件规则。 |
| [AGENTS.md](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/AGENTS.md>) | 开发代理工作范围和设计约束；不会自动成为每次模型聊天的系统提示词。 |
| [LICENSE](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/LICENSE>) | 授权条款。 |
| [README.md](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/README.md>) | 项目使用、开发和运行说明。 |
| [next-env.d.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/next-env.d.ts>) | Next 自动生成的 TypeScript 类型引用。 |
| [next.config.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/next.config.ts>) | Next 部署子路径、构建目录、独立部署输出和开发选项。 |
| [package-lock.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/package-lock.json>) | 依赖的精确版本和解析结果。 |
| [package.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/package.json>) | 依赖和开发、构建、生成规范、测试等命令入口。 |
| [tsconfig.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/tsconfig.json>) | TypeScript 编译及路径配置。 |
| [vitest.config.mts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/vitest.config.mts>) | Vitest 测试配置。 |

### src

| 文件 | 作用 |
|---|---|
| [src/app/analytics.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/analytics.tsx>) | 可选访问统计接入，不负责决定回答内容。 |
| [src/app/api/chat/route.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/api/chat/route.ts>) | 模型请求入口：验证请求、裁剪历史、组装模型指令、选择模型服务、把输出转换/转发为 SSE。 |
| [src/app/api/image-search/route.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/api/image-search/route.ts>) | 查询 Wikipedia/Wikimedia 图片，供图片组件按需使用。 |
| [src/app/api/street-route/route.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/api/street-route/route.ts>) | 查询并缓存 OSRM 道路路线几何，不是订单或实时交通服务。 |
| [src/app/api/wiki/route.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/api/wiki/route.ts>) | 查询 Wikipedia 文章照片及相关信息，提供缓存。 |
| [src/app/apple-icon.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/apple-icon.png>) | 站点图标、分享预览或静态演示媒体。 |
| [src/app/examples/[id]/page.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/examples/[id]/page.tsx>) | 按示例 ID 加载已保存案例的页面入口。 |
| [src/app/examples/[id]/saved-example.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/examples/[id]/saved-example.tsx>) | 直接用 Renderer 展示固定程序；追问不走实时模型。 |
| [src/app/fliggy-shell.css](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/fliggy-shell.css>) | 聊天外壳、输入区、用户消息和等待态等飞猪视觉。 |
| [src/app/gallery/composition-programs.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/gallery/composition-programs.ts>) | 组合界面示例。 |
| [src/app/gallery/fliggy-module-programs.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/gallery/fliggy-module-programs.ts>) | 飞猪业务模块示例程序。 |
| [src/app/gallery/fliggy-program.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/gallery/fliggy-program.ts>) | 飞猪示例程序。 |
| [src/app/gallery/gallery.css](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/gallery/gallery.css>) | 展示页样式。 |
| [src/app/gallery/gallery.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/gallery/gallery.tsx>) | 组件展示页组织和示例渲染。 |
| [src/app/gallery/page.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/gallery/page.tsx>) | 组件展示页路由入口。 |
| [src/app/gallery/programs.test.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/gallery/programs.test.ts>) | 对应模块的自动化测试；不参与正常用户请求。 |
| [src/app/gallery/programs.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/gallery/programs.ts>) | 基础组件手写示例。 |
| [src/app/gallery/tool-programs.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/gallery/tool-programs.ts>) | 工具与仪表盘手写示例。 |
| [src/app/globals.css](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/globals.css>) | 全局基础样式。 |
| [src/app/icon.svg](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/icon.svg>) | 站点图标、分享预览或静态演示媒体。 |
| [src/app/layout.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/layout.tsx>) | 全站 HTML 外壳、网页标题与分享信息、全局样式、Analytics。 |
| [src/app/opengraph-image.alt.txt](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/opengraph-image.alt.txt>) | 站点图标、分享预览或静态演示媒体。 |
| [src/app/opengraph-image.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/opengraph-image.png>) | 站点图标、分享预览或静态演示媒体。 |
| [src/app/page.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/page.tsx>) | 聊天总入口：组装 AgentInterface、组件库、发送通道、浅色主题、存储和嵌入桥。 |
| [src/app/preview/page.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/preview/page.tsx>) | 脚本预览页入口。 |
| [src/app/preview/preview.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/app/preview/preview.tsx>) | 渲染脚本注入的程序，暴露错误和动作供验证。 |
| [src/generated/dashboard-system-prompt.txt](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/generated/dashboard-system-prompt.txt>) | 包含演示数据工具的仪表盘提示词导出。 |
| [src/generated/spec.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/generated/spec.json>) | 由组件库导出的机器可读规范，聊天服务端实际导入此文件。 |
| [src/generated/system-prompt.txt](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/generated/system-prompt.txt>) | 导出的完整普通聊天提示词，便于查看和基准脚本使用；当前聊天 route 不直接读取此文本。 |
| [src/lib/actions.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/actions.ts>) | 注册和执行自定义 CopyToClipboard 动作；Set/ToAssistant 等由 OpenUI 运行时/聊天层处理。 |
| [src/lib/assets/fliggy/assets.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/assets/fliggy/assets.json>) | 组件使用的飞猪图标/图片资产或资产索引。 |
| [src/lib/assets/fliggy/flight.svg](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/assets/fliggy/flight.svg>) | 组件使用的飞猪图标/图片资产或资产索引。 |
| [src/lib/assets/fliggy/notice.svg](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/assets/fliggy/notice.svg>) | 组件使用的飞猪图标/图片资产或资产索引。 |
| [src/lib/assets/fliggy/poi.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/assets/fliggy/poi.png>) | 组件使用的飞猪图标/图片资产或资产索引。 |
| [src/lib/assets/fliggy/refresh.svg](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/assets/fliggy/refresh.svg>) | 组件使用的飞猪图标/图片资产或资产索引。 |
| [src/lib/assets/fliggy/slider-thumb.svg](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/assets/fliggy/slider-thumb.svg>) | 组件使用的飞猪图标/图片资产或资产索引。 |
| [src/lib/assets/fliggy/table-copy.svg](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/assets/fliggy/table-copy.svg>) | 组件使用的飞猪图标/图片资产或资产索引。 |
| [src/lib/assets/fliggy/table-expand.svg](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/assets/fliggy/table-expand.svg>) | 组件使用的飞猪图标/图片资产或资产索引。 |
| [src/lib/base-path.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/base-path.ts>) | 统一部署子路径及 URL 前缀。 |
| [src/lib/browser-crypto.test.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/browser-crypto.test.ts>) | 对应模块的自动化测试；不参与正常用户请求。 |
| [src/lib/browser-crypto.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/browser-crypto.ts>) | 为缺少 crypto.randomUUID 的浏览器环境提供兼容实现。 |
| [src/lib/chat-storage.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/chat-storage.tsx>) | localStorage 会话列表、消息读取与保存；回答停止流式生成后保存消息及其中的界面状态。 |
| [src/lib/components/cabin/airline-catalog.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/cabin/airline-catalog.json>) | 航司机型/布局目录数据。 |
| [src/lib/components/cabin/cabin.css](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/cabin/cabin.css>) | 机舱布局样式。 |
| [src/lib/components/cabin/cabin.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/cabin/cabin.tsx>) | 注册并显示机舱组件，将用户需求、座位状态与推荐连接。 |
| [src/lib/components/cabin/model.test.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/cabin/model.test.ts>) | 对应模块的自动化测试；不参与正常用户请求。 |
| [src/lib/components/cabin/model.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/cabin/model.ts>) | 机舱数据处理、座位组合与推荐条件等业务计算。 |
| [src/lib/components/cabin/presets.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/cabin/presets.json>) | 内置机舱布局预设数据。 |
| [src/lib/components/cabin/vendor/README.md](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/cabin/vendor/README.md>) | 底层机舱资产说明。 |
| [src/lib/components/cabin/vendor/cabin-kit.css](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/cabin/vendor/cabin-kit.css>) | 底层机舱样式。 |
| [src/lib/components/cabin/vendor/cabin-kit.js](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/cabin/vendor/cabin-kit.js>) | 机舱可视化底层实现资产。 |
| [src/lib/components/chart.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/chart.tsx>) | 图表组件。 |
| [src/lib/components/components.css](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/components.css>) | 基础组件通用样式样式。 |
| [src/lib/components/controls.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/controls.tsx>) | 输入框、按钮、滑块、选择器等控件；绑定页面状态和操作。 |
| [src/lib/components/extra.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/extra.tsx>) | 轮播、弹出层、代码、公式、翻卡、庆祝效果、视频等扩展组件。 |
| [src/lib/components/fliggy-answer-text.css](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/fliggy-answer-text.css>) | 回答外部文字排版样式。 |
| [src/lib/components/fliggy-buttons.css](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/fliggy-buttons.css>) | 飞猪按钮样式。 |
| [src/lib/components/fliggy-colors.css](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/fliggy-colors.css>) | 飞猪组件颜色样式。 |
| [src/lib/components/fliggy-controls.css](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/fliggy-controls.css>) | 飞猪滑块和选择控件样式。 |
| [src/lib/components/fliggy-form-fields.css](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/fliggy-form-fields.css>) | 飞猪表单字段样式。 |
| [src/lib/components/fliggy-modules.css](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/fliggy-modules.css>) | 飞猪业务模块样式。 |
| [src/lib/components/fliggy-typography.css](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/fliggy-typography.css>) | 组件内部字体排版样式。 |
| [src/lib/components/glyph.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/glyph.tsx>) | 识别和规范化图标名称，按需加载 Lucide 图标。 |
| [src/lib/components/html-view.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/html-view.tsx>) | 在受限制 iframe 中运行生成的 HTML；等待完整生成后运行。 |
| [src/lib/components/layout.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/layout.tsx>) | Col/Row/Grid/Card/Box/Form 等布局组件及参数定义。 |
| [src/lib/components/lucide-dynamic.d.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/lucide-dynamic.d.ts>) | 动态图标模块 TypeScript 类型声明。 |
| [src/lib/components/map/basemap.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/map/basemap.ts>) | 按需加载 MapLibre、配置 worker 和底图样式。 |
| [src/lib/components/map/itinerary.css](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/map/itinerary.css>) | 地图行程联动样式。 |
| [src/lib/components/map/itinerary.test.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/map/itinerary.test.ts>) | 对应模块的自动化测试；不参与正常用户请求。 |
| [src/lib/components/map/itinerary.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/map/itinerary.tsx>) | ItineraryMap：同一组站点驱动地图和行程详情联动。 |
| [src/lib/components/map/map-utils.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/map/map-utils.ts>) | 经纬度校验、坐标转换和地图范围等辅助计算。 |
| [src/lib/components/map/map.css](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/map/map.css>) | 地图样式。 |
| [src/lib/components/map/map.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/map/map.tsx>) | Map、MapMarker 的地图渲染与交互。 |
| [src/lib/components/map/selection-context.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/map/selection-context.ts>) | 地图相关选择状态的共享上下文。 |
| [src/lib/components/map/use-dialog.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/map/use-dialog.ts>) | 地图展开对话框的交互辅助。 |
| [src/lib/components/map/use-street-route.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/map/use-street-route.ts>) | 请求道路路线、处理加载/结果供地图使用。 |
| [src/lib/components/markdown.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/markdown.tsx>) | Markdown 文字的显示实现。 |
| [src/lib/components/media.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/media.tsx>) | 图片、搜索图片和图标组件；需要时触发图片查询。 |
| [src/lib/components/scheme.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/scheme.ts>) | 读取组件所在区域的亮/暗配色状态。 |
| [src/lib/components/spacing.test.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/spacing.test.ts>) | 对应模块的自动化测试；不参与正常用户请求。 |
| [src/lib/components/style.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/style.ts>) | 共用样式参数 Schema、尺寸/颜色等转换及 URL/CSS 值检查。 |
| [src/lib/components/svg.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/svg.tsx>) | SVG 图形原语，可被模型组合成图解。 |
| [src/lib/components/table.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/table.tsx>) | 表格组件及复制、展开等操作。 |
| [src/lib/components/text.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/text.tsx>) | 标题、正文、标签、列表、链接和 Markdown 组件注册。 |
| [src/lib/components/theme.css](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/theme.css>) | 基础组件主题变量样式。 |
| [src/lib/components/travel.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/components/travel.tsx>) | TravelModule/TravelItem/DayBadge/Price/FieldRow 等旅游业务展示组件。 |
| [src/lib/demo-data.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/demo-data.ts>) | 演示订单、工单和流量数据工具；不是正式旅游库存接口，也未由普通聊天配置自动启用。 |
| [src/lib/devtools.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/devtools.ts>) | 开发调试工具接入。 |
| [src/lib/embed-config.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/embed-config.ts>) | 读取允许嵌入父页面的来源配置。 |
| [src/lib/embed-controller.test.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/embed-controller.test.ts>) | 对应模块的自动化测试；不参与正常用户请求。 |
| [src/lib/embed-controller.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/embed-controller.ts>) | 嵌入请求去重、忙碌检查、开始/完成/失败响应。 |
| [src/lib/embed-evidence.test.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/embed-evidence.test.ts>) | 对应模块的自动化测试；不参与正常用户请求。 |
| [src/lib/embed-evidence.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/embed-evidence.ts>) | 解析模型输出，收集组件、状态和错误；不是实际交互测试。 |
| [src/lib/embed-protocol.test.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/embed-protocol.test.ts>) | 对应模块的自动化测试；不参与正常用户请求。 |
| [src/lib/embed-protocol.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/embed-protocol.ts>) | 定义和验证父页面发送的消息格式及可信来源。 |
| [src/lib/fliggy-colors.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/fliggy-colors.json>) | 飞猪颜色资产数据。 |
| [src/lib/fliggy-composer.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/fliggy-composer.tsx>) | 用户输入与发送：调用 processMessage；处理回车、停止生成、发送错误；语音/附件禁用。 |
| [src/lib/fliggy-embed-bridge.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/fliggy-embed-bridge.tsx>) | 将外部页面消息接入聊天状态，返回请求进度、输出和解析证据。 |
| [src/lib/fliggy-layout.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/fliggy-layout.ts>) | 聊天主题中的间距与圆角映射。 |
| [src/lib/fliggy-sidebar.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/fliggy-sidebar.tsx>) | 会话历史侧栏和新聊天入口。 |
| [src/lib/fliggy-theme.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/fliggy-theme.ts>) | 组装聊天界面的飞猪主题。 |
| [src/lib/fliggy-typography.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/fliggy-typography.ts>) | 聊天主题中的字体、字号、字重和行高映射。 |
| [src/lib/fliggy-welcome.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/fliggy-welcome.tsx>) | 欢迎页和分类推荐问题；点击后进入普通消息流程。 |
| [src/lib/functions/__tests__/dates-data.test.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/functions/__tests__/dates-data.test.ts>) | 对应模块的自动化测试；不参与正常用户请求。 |
| [src/lib/functions/__tests__/lists.test.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/functions/__tests__/lists.test.ts>) | 对应模块的自动化测试；不参与正常用户请求。 |
| [src/lib/functions/__tests__/numbers-text.test.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/functions/__tests__/numbers-text.test.ts>) | 对应模块的自动化测试；不参与正常用户请求。 |
| [src/lib/functions/__tests__/patterns.test.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/functions/__tests__/patterns.test.ts>) | 对应模块的自动化测试；不参与正常用户请求。 |
| [src/lib/functions/__tests__/run.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/functions/__tests__/run.ts>) | 通过实际解析与求值执行函数测试的辅助工具。 |
| [src/lib/functions/colors.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/functions/colors.ts>) | 颜色计算函数。 |
| [src/lib/functions/data.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/functions/data.ts>) | 分组、聚合、统计等数据函数。 |
| [src/lib/functions/dates.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/functions/dates.ts>) | 日期计算与格式化函数。 |
| [src/lib/functions/index.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/functions/index.ts>) | 汇总并导出注册给 OpenUI 的函数。 |
| [src/lib/functions/lists.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/functions/lists.ts>) | 列表追加、移除、更新等函数。 |
| [src/lib/functions/numbers.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/functions/numbers.ts>) | 数值与计算函数。 |
| [src/lib/functions/shared.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/functions/shared.ts>) | 函数间共享的转换/校验辅助。 |
| [src/lib/functions/text.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/functions/text.ts>) | 文本处理与格式化函数。 |
| [src/lib/library.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/library.ts>) | 注册全部可用组件、函数、自定义动作及分组说明；前端渲染和生成规范的共同源头。 |
| [src/lib/mobile-preview-bridge.test.cjs](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/mobile-preview-bridge.test.cjs>) | 对应模块的自动化测试；不参与正常用户请求。 |
| [src/lib/prompt-options.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/prompt-options.ts>) | 回答原则、设计规则、交互规则、示范程序；导出普通聊天和仪表盘两套配置。 |
| [src/lib/same-origin.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/src/lib/same-origin.ts>) | 检查请求 Origin 是否在允许范围内；不是用户登录认证。 |

### public

| 文件 | 作用 |
|---|---|
| [public/cabin-atlas/ca.gif](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/cabin-atlas/ca.gif>) | 航司机舱布局参考图资产。 |
| [public/cabin-atlas/cx.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/cabin-atlas/cx.png>) | 航司机舱布局参考图资产。 |
| [public/cabin-atlas/cz.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/cabin-atlas/cz.png>) | 航司机舱布局参考图资产。 |
| [public/cabin-atlas/hu.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/cabin-atlas/hu.png>) | 航司机舱布局参考图资产。 |
| [public/cabin-style-sheet/cabin-kit.css](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/cabin-style-sheet/cabin-kit.css>) | cabin-kit样式。 |
| [public/cabin-style-sheet/cabin-kit.js](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/cabin-style-sheet/cabin-kit.js>) | 独立机舱样式/组件展示资料。 |
| [public/cabin-style-sheet/fliggy.css](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/cabin-style-sheet/fliggy.css>) | fliggy样式。 |
| [public/cabin-style-sheet/index.html](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/cabin-style-sheet/index.html>) | 独立机舱样式/组件展示资料。 |
| [public/cabin-style-sheet/tokens.css](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/cabin-style-sheet/tokens.css>) | tokens样式。 |
| [public/embed-parent-origins.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/embed-parent-origins.json>) | 允许嵌入父页面的来源列表。 |
| [public/fliggy-shell/camera.svg](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/fliggy-shell/camera.svg>) | 聊天外壳的静态图标或图片。 |
| [public/fliggy-shell/handle.svg](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/fliggy-shell/handle.svg>) | 聊天外壳的静态图标或图片。 |
| [public/fliggy-shell/history.svg](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/fliggy-shell/history.svg>) | 聊天外壳的静态图标或图片。 |
| [public/fliggy-shell/input-texture.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/fliggy-shell/input-texture.png>) | 聊天外壳的静态图标或图片。 |
| [public/fliggy-shell/new-chat.svg](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/fliggy-shell/new-chat.svg>) | 聊天外壳的静态图标或图片。 |
| [public/fliggy-shell/query-star.svg](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/fliggy-shell/query-star.svg>) | 聊天外壳的静态图标或图片。 |
| [public/fliggy-shell/voice.svg](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/fliggy-shell/voice.svg>) | 聊天外壳的静态图标或图片。 |
| [public/fliggy-shell/welcome-pig.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/fliggy-shell/welcome-pig.png>) | 聊天外壳的静态图标或图片。 |
| [public/mobile-preview-bridge.js](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/mobile-preview-bridge.js>) | 手机预览宿主与聊天 iframe 的联动。 |
| [public/mobile-preview.html](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/mobile-preview.html>) | 手机外观预览宿主页面。 |
| [public/scenario-examples/component-checklist.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/component-checklist.json>) | 预先保存的 component-checklist 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/component-map.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/component-map.json>) | 预先保存的 component-map 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/component-pet-hotel.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/component-pet-hotel.json>) | 预先保存的 component-pet-hotel 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/generic-budget.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/generic-budget.json>) | 预先保存的 generic-budget 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/generic-compare.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/generic-compare.json>) | 预先保存的 generic-compare 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/generic-create.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/generic-create.json>) | 预先保存的 generic-create 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/generic-explore.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/generic-explore.json>) | 预先保存的 generic-explore 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/generic-howto.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/generic-howto.json>) | 预先保存的 generic-howto 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/generic-knowledge.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/generic-knowledge.json>) | 预先保存的 generic-knowledge 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/generic-learn.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/generic-learn.json>) | 预先保存的 generic-learn 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/generic-play.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/generic-play.json>) | 预先保存的 generic-play 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/generic-sales.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/generic-sales.json>) | 预先保存的 generic-sales 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/generic-travel.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/generic-travel.json>) | 预先保存的 generic-travel 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/ota-budget.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/ota-budget.json>) | 预先保存的 ota-budget 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/ota-compare.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/ota-compare.json>) | 预先保存的 ota-compare 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/ota-create.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/ota-create.json>) | 预先保存的 ota-create 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/ota-explore.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/ota-explore.json>) | 预先保存的 ota-explore 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/ota-family-pet.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/ota-family-pet.json>) | 预先保存的 ota-family-pet 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/ota-howto.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/ota-howto.json>) | 预先保存的 ota-howto 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/ota-knowledge.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/ota-knowledge.json>) | 预先保存的 ota-knowledge 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/ota-learn.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/ota-learn.json>) | 预先保存的 ota-learn 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/ota-play.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/ota-play.json>) | 预先保存的 ota-play 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/ota-reschedule.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/ota-reschedule.json>) | 预先保存的 ota-reschedule 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/ota-sales.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/ota-sales.json>) | 预先保存的 ota-sales 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/ota-sanya-day.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/ota-sanya-day.json>) | 预先保存的 ota-sanya-day 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/ota-team-split.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/ota-team-split.json>) | 预先保存的 ota-team-split 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/ota-travel.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/ota-travel.json>) | 预先保存的 ota-travel 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/scenario-examples/ota-west-checklist.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/scenario-examples/ota-west-checklist.json>) | 预先保存的 ota-west-checklist 场景数据/界面程序；展示时不等于重新调用模型。 |
| [public/shiro-face.svg](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/shiro-face.svg>) | 站点图标、分享预览或静态演示媒体。 |
| [public/shiro-woodworker.svg](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/public/shiro-woodworker.svg>) | 站点图标、分享预览或静态演示媒体。 |

### scripts

| 文件 | 作用 |
|---|---|
| [scripts/bench/prompts.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/scripts/bench/prompts.json>) | 基准测试问题集。 |
| [scripts/bench/run.mjs](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/scripts/bench/run.mjs>) | 批量模型生成、解析检查、截图与报告脚本。 |
| [scripts/scenarios/README.md](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/scripts/scenarios/README.md>) | 场景生成和验证使用说明。 |
| [scripts/scenarios/add-ota.py](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/scripts/scenarios/add-ota.py>) | 补充 OTA 场景数据的维护脚本。 |
| [scripts/scenarios/archive/20261021-213522/component-checklist.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/scripts/scenarios/archive/20261021-213522/component-checklist.json>) | 历史场景快照，不参与实时聊天。 |
| [scripts/scenarios/archive/20261021-213522/ota-west-checklist.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/scripts/scenarios/archive/20261021-213522/ota-west-checklist.json>) | 历史场景快照，不参与实时聊天。 |
| [scripts/scenarios/generate.mjs](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/scripts/scenarios/generate.mjs>) | 生成并保存场景程序；部分场景附加专门指令，包括改期滑块。 |
| [scripts/scenarios/inputs.json](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/scripts/scenarios/inputs.json>) | 场景输入需求定义。 |
| [scripts/scenarios/verify.mjs](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/scripts/scenarios/verify.mjs>) | 保存场景的验证脚本。 |

### integrations

| 文件 | 作用 |
|---|---|
| [integrations/qoderwork/README.md](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/integrations/qoderwork/README.md>) | QoderWork 集成说明；使用宿主模型，不依赖普通聊天 API 链路。 |
| [integrations/qoderwork/app.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/integrations/qoderwork/app.tsx>) | MCP App 内的界面渲染入口。 |
| [integrations/qoderwork/build.mjs](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/integrations/qoderwork/build.mjs>) | 构建 MCP App 集成。 |
| [integrations/qoderwork/dist/app.html](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/integrations/qoderwork/dist/app.html>) | 辅助文件；本次未逐行审阅，具体行为请以源文件为准。 |
| [integrations/qoderwork/library.ts](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/integrations/qoderwork/library.ts>) | 为 QoderWork 集成导出组件库。 |
| [integrations/qoderwork/server.mjs](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/integrations/qoderwork/server.mjs>) | 本地 stdio MCP 服务，向宿主提供 OpenUI 渲染能力。 |
| [integrations/qoderwork/smoke.mjs](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/integrations/qoderwork/smoke.mjs>) | 集成冒烟检查。 |

### deploy

| 文件 | 作用 |
|---|---|
| [deploy/aliyun/Caddyfile](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/deploy/aliyun/Caddyfile>) | Caddy 反向代理配置。 |
| [deploy/aliyun/Dockerfile](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/deploy/aliyun/Dockerfile>) | 部署镜像构建。 |
| [deploy/aliyun/README.md](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/deploy/aliyun/README.md>) | 部署操作说明。 |
| [deploy/aliyun/compose.yaml](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/deploy/aliyun/compose.yaml>) | 容器服务编排。 |
| [deploy/aliyun/nginx.conf](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/deploy/aliyun/nginx.conf>) | Nginx 反向代理配置。 |
| [deploy/aliyun/runtime.env.example](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/deploy/aliyun/runtime.env.example>) | 部署运行环境变量模板。 |

### standalone-source

| 文件 | 作用 |
|---|---|
| [standalone-source/build-viewer.mjs](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/standalone-source/build-viewer.mjs>) | 打包独立查看器。 |
| [standalone-source/export-reschedule.py](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/standalone-source/export-reschedule.py>) | 将已保存改期案例导出独立 HTML。 |
| [standalone-source/pack.py](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/standalone-source/pack.py>) | 组装独立 HTML 与展示资料。 |
| [standalone-source/viewer.tsx](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/standalone-source/viewer.tsx>) | 独立查看器：可展示固定程序，也含单独的模型调用路径；不等同主聊天实现。 |

### docs

| 文件 | 作用 |
|---|---|
| [docs/figma-module-inventory.md](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/figma-module-inventory.md>) | 项目说明/设计映射/集成说明资料；不自动发送给模型。 |
| [docs/fliggy-airline-atlas.md](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/fliggy-airline-atlas.md>) | 项目说明/设计映射/集成说明资料；不自动发送给模型。 |
| [docs/fliggy-cabin-mapping.md](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/fliggy-cabin-mapping.md>) | 项目说明/设计映射/集成说明资料；不自动发送给模型。 |
| [docs/fliggy-design-migration.md](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/fliggy-design-migration.md>) | 项目说明/设计映射/集成说明资料；不自动发送给模型。 |
| [docs/iframe-integration.md](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/iframe-integration.md>) | 项目说明/设计映射/集成说明资料；不自动发送给模型。 |
| [docs/openui-chatgpt-comparison.jpg](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/openui-chatgpt-comparison.jpg>) | 项目说明/设计映射/集成说明资料；不自动发送给模型。 |
| [docs/openui-chatgpt-comparison.mp4](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/openui-chatgpt-comparison.mp4>) | 项目说明/设计映射/集成说明资料；不自动发送给模型。 |
| [docs/verification/compact-budget-model-output.txt](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/compact-budget-model-output.txt>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-answer-text.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-answer-text.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-badge-rounded.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-badge-rounded.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-badges.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-badges.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-buttons.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-buttons.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-cabin-custom.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-cabin-custom.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-cabin-linked.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-cabin-linked.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-cabin-nose.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-cabin-nose.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-cabin.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-cabin.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-chat-white-cards.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-chat-white-cards.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-checklist.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-checklist.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-colors-purple.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-colors-purple.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-colors.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-colors.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-compact-answer.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-compact-answer.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-composer-simplified.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-composer-simplified.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-controls-table.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-controls-table.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-csair-cabin.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-csair-cabin.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-form-fields.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-form-fields.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-form-states.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-form-states.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-itinerary-map.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-itinerary-map.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-labels.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-labels.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-layout-2x.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-layout-2x.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-layout-spacing-1x.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-layout-spacing-1x.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-layout.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-layout.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-mobile-shell.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-mobile-shell.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-module-h3.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-module-h3.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-modules-mobile.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-modules-mobile.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-sidebar.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-sidebar.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-spacing-nearest.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-spacing-nearest.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-table-border-fix.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-table-border-fix.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-thinking.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-thinking.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-typography-mapped.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-typography-mapped.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-typography.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-typography.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-user-bubble-mobile.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-user-bubble-mobile.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/fliggy-welcome.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/fliggy-welcome.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/map-credits-collapsed.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/map-credits-collapsed.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |
| [docs/verification/mobile-preview.png](</Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open ui-fliggy/docs/verification/mobile-preview.png>) | 历史验证截图或模型输出证据，不参与实时聊天。 |

## 本地配置、依赖、构建产物和副本

| 路径 | 作用与主链路关系 |
|---|---|
| .env.local | 本机模型连接等配置；服务端使用。本报告未读取其值。 |
| node_modules/ | 安装的第三方代码，包括 OpenUI 的解析/渲染引擎；由包管理器维护。 |
| .next/、.next-deploy/ | 开发/构建生成产物，目录选择由 next.config.ts 控制。 |
| tsconfig.tsbuildinfo | TypeScript 增量检查缓存。 |
| standalone-source/lib/、generated/ | 独立查看器的源码/规范副本；不能把修改主 src 视为副本自动同步。 |
| standalone-source/build/ | 独立查看器打包的 JS/CSS。 |
| outputs/ | 设计或组件导出资料，非主聊天入口。 |
| distribution/ | 分发快照，包含 app/web 副本；不是当前 src 的第二套自动同步入口。 |
| .DS_Store | macOS 文件夹元数据，无业务作用。 |

## 设计师改什么，影响哪里

- 改“什么需求使用什么界面”：prompt-options.ts，同时核对示例是否一致。
- 改“模型能用哪些组件”：components + library.ts，然后重新 generate/prompt。
- 改“界面真实外观”：components 下对应 CSS；聊天外壳另看 fliggy-shell.css 和主题文件。
- 改“按钮真实行为”：组件状态绑定、内置动作或 actions.ts，外部业务需要额外接口。
- 改“欢迎推荐需求”：fliggy-welcome.tsx。
- 改“默认固定展示案例”：gallery 程序或 public/scenario-examples 对应 JSON，不等于修改实时模型行为。
