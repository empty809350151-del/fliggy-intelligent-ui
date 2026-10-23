# Fliggy 设计资产迁移记录

## 协作规则

仅修改 `open ui-fliggy`。用户提供一部分设计资产后，完成实现和实际页面测试，再等待用户明确确认；未经确认不进入下一部分。顺序：颜色 → 字体 → 圆角与间距 → 各组件样式。

## 第一步：颜色（2026-10-20，调整后用户已确认通过）

来源：[Fliggy-Style / 色彩 Colors，节点 4:90](https://www.figma.com/design/P2lMwWNTqJIBQ1d5I9pTyY/Fliggy-Style?node-id=4-90)。

- `src/lib/fliggy-colors.json`：读取到的 48 个颜色 Token；去掉 Figma 分组前缀并合并同名同值项。保留源数据中的 `Color_green_0` 大小写。
- `src/lib/components/fliggy-colors.css`：对应原始色值和浅色语义映射。调整原始色值时需与 JSON 同步；此文件不是自动生成产物。
- `src/lib/fliggy-theme.ts`：聊天外壳的颜色配置，使用现有 `createTheme` 接口。显式传入空 `darkTheme`，避免浅色配置被套用到深色模式。
- Web 和 QoderWork 两个组件库入口共用颜色样式。

| 现有语义 | 飞猪对应值 |
| --- | --- |
| 主要文字 / 次要文字 / 浅灰字 | `#0F131A` / `#5C5F66` / `#919499` |
| 页面背景 / 卡片背景 / 标签背景 | `#F2F3F5` / `#FFFFFF` / `#F7F8FA` |
| 分割线 / 控件边框 | `#F2F3F5` / `#D2D4D9` |
| 通用主操作 | 主色紫 `#6666FF`，白字 `#FFFFFF`；hover / pressed 使用主色混入 10% / 20% 黑色 |
| success | 正向反馈 `Color_green_0`：`#149AA8` |
| warning / danger | 警示红 `#FF3333` |
| info / purple / 焦点 | 辅助黄 `#FFE033`，浅底 `#FFFCEB` |
| 图表六色 | 图标蓝、正向绿、辅助黄、预订橙、支付橙、保障深 |

通用主操作、hover、info、焦点和图表顺序是适配现有组件的映射选择，需由用户验收；不是 Figma 明确给出的完整交互状态规范。

预订橙 `#FF8C1A`、支付橙 `#FF5533`、保障色及完整色阶已入库并展示。业务专用按钮和价格字段的语义接入，留待相应组件资产阶段；未把所有数字或通用按钮判定为支付、预订场景。

Figma 的正向反馈文字说明指向 `color_green_0`（青绿色），另有 `color_green_1 #47B259`，两者均保留；success 使用前者。

## 范围与保留项

- 本轮只迁移浅色颜色；没有提供深色资产，深色仍使用旧配色，并明确恢复 gallery 暗色容器的中性色，防止继承浅色映射。
- 原有 pink 语义无对应资产，保留原值。阴影、玻璃透明层和示例内显式指定的插画、热力图等业务颜色未全面替换。
- 原有 Logo、欢迎插画、字体、字号、圆角、间距和组件结构不在本轮范围。
- 组件名、参数顺序、颜色枚举、函数和提示词协议未改变，因此不需要重新生成 spec / prompt。

## 验收

运行 `npm run dev -- --port 3100`，打开：

- `http://localhost:3100/gallery?theme=light#fliggy-colors`：原有 Renderer 渲染的颜色验收示例；包含完整色板、文字、卡片、状态标签、输入框和可点击按钮。
- `http://localhost:3100/`：聊天界面。

已通过 `npm run typecheck`、`npm test`（319 项）和 `npm run build`。
实际浏览器检查：浅色主按钮为 `rgb(255, 224, 51)`、深色字为 `rgb(15, 19, 26)`；输入杭州并点击按钮后有状态反馈；gallery 渲染错误数为 0；390px 宽度无页面横向溢出；gallery 和聊天界面均完成深浅色切换检查。

本轮不以调用模型生成回答为验收前提；实际检查使用本项目的组件库和 Renderer。
用户此前确认后重新提出颜色调整：紫色作为主色，黄色接替原紫色语义，紫色主按钮使用白字。已更新组件库与聊天外壳的浅色语义映射；原始 Figma 色板保留，以便追溯来源。原色板中的名称不代表当前语义映射。
上面的浏览器检查记录为第一版结果。调整版已通过类型检查；实际页面读取主按钮默认背景 `rgb(102, 102, 255)`、文字 `rgb(255, 255, 255)`，辅助高亮为 `rgb(255, 224, 51)`，点击反馈正常，gallery 渲染错误为 0。截图：`docs/verification/fliggy-colors-purple.png`。
用户在主色互换、紫色按钮白字、标签统一灰底深色字后明确回复“OK 继续字体”，颜色调整版验收通过。

### 标签统一配色

按用户最新要求，所有 Badge（neutral、info、success、warning、danger、purple、pink）统一使用 `color_bg #F2F3F5` 背景和 `color_darkgray #0F131A` 文字，图标跟随文字颜色。此明确规则在深浅色模式中均适用，覆盖此前标签状态色映射。保留 color 参数协议，仅取消按类型区分标签颜色；主按钮仍为紫底白字，其他组件状态色不变。

## 第二步：字体（层级映射调整已由用户确认通过）

来源：[Fliggy-Style / 字体，节点 246:149](https://www.figma.com/design/P2lMwWNTqJIBQ1d5I9pTyY/Fliggy-Style?node-id=246-149)。用户选择方案 **1：按 2 倍稿换算为 CSS 像素**。

| 设计语义 | CSS 字号 | 字重 | 行高 |
| --- | --- | --- | --- |
| h1 / h2 / h3 | 24 / 21 / 18px | Medium 500 | 1.4 |
| subtitle | 15px | Medium 500 | 1.4 |
| body / paragraph | 15px | Regular 400 | 1.4 / 1.7 |
| body1 / body2 / body3 / body4 | 14 / 13 / 12 / 11px | Regular 400 或 Medium 500 | 1.4 |
| caption / caption1 | 10 / 9px | Regular 400（caption 支持 Medium） | 1.4 |

- 字体栈为 `"PingFang SC", "Microsoft YaHei", sans-serif`，字距为 0。移除 Next/Google Inter 加载；当前没有提供苹方字体文件，使用设备本地字体，其他平台按字体栈回退。
- `src/lib/components/fliggy-typography.css` 保存字号 Token 和现有组件的语义映射，Web / QoderWork 入口共用。`src/lib/fliggy-typography.ts` 配置聊天外壳的基础和复合字体 Token；深浅色共用字体配置，深色不引入浅色颜色。
- Title：sm → 15、md → 18、lg → 21、xl → 24、2xl → 32、3xl → 40。卡片首个 sm / md 标题为 14，卡片 / 网格 / 轮播中的大标题为 18；协议名称不变。
- Text 默认 / md → 15、行高 1.7；sm → 14、xs → 12、lg → 18、行高 1.4。Caption → 12；卡片标题紧邻的副文案 → 13。原 medium / semibold 均映射到 500。按钮、输入框、标签、表格、图表、地图标签、SvgText 的常规字体同步适配。
- 11px 用于图表刻度等紧凑辅助信息；9px 用于地图 attribution。没有为展示所有字号扩展 OpenUI 参数协议。代码保留等宽字体，公式保留 KaTeX 字体；SVG 显式字号与沙箱 HTML 内部排版不强制改成正文。
- 原稿存在标注不一致：h2 的标注文字为 42 且对应样式为 42，但标注自身字号为 36；body3Bold 字重说明写 Regular，实际样式为 Medium；caption1 标注 18，示例文字实际为 20。本轮分别按 42 / Medium / 标注的 18 换算。
- 本轮仅调整字体属性，颜色、圆角、padding / gap 和组件结构保持原有配置；文字换行和行高变化会影响自然高度。

验收地址：`http://localhost:3100/gallery?theme=light#fliggy-typography`。使用项目真实 Renderer 和组件库，输入目的地、点击“确认字体效果”可以检查交互。聊天生成的同库组件也自动使用新字体。

验证：类型检查、320 项测试、生产构建通过。浏览器实际读取标题 24 / 21 / 18px、字重 500，正文 15px / 25.5px / 400，卡片副文案 13px / 18.2px；输入和按钮交互通过，gallery 渲染错误数为 0。390px 视口标题仍为 24px，文档无横向溢出。紫色主按钮与灰底深字标签保持已验收配色。截图：`docs/verification/fliggy-typography.png`。

补充实测：深色组件标题同样为 24px / 33.6px / 500；聊天欢迎标题为 24px / 33.6px / 500，聊天输入框为 15px / 21px / 400。聊天库这两处固定行高已在 `globals.css` 中适配。

用户回复“OK继续”，字体阶段验收通过。

### 2026-10-20：保留原字号层级的临近映射

用户已确认实施映射表。以上首版验收记录为历史结果，当前以下表为准。先把 Fliggy 2 倍稿换算为 CSS px，再按原组件的使用场景就近映射；超过提供的最大 24px 档位时保留原项目大字号作为兼容档，不新增虚构的 Fliggy Token。

| 使用场景 | 原项目 CSS px | 当前 CSS px |
| --- | --- | --- |
| Title sm / md / lg / xl | 15 / 17 / 21 / 25 | 15 / 18 / 21 / 24 |
| Title 2xl / 3xl | 32 / 40 | 32 / 40（兼容档） |
| ≤640px 的 Title lg / 2xl / 3xl | 19 / 28 / 34 | 18 / 28 / 34 |
| 卡片首行 sm / md 标题 | 14 | 14 |
| 卡片、网格、轮播内大标题 | 18 | 18 |
| 卡片副文案 / 段落 | 13 / 15 | 13 / 15 |
| Text md、Markdown 正文、引用 | 16 | 15 |
| Text xs / sm / lg | 12 / 14 / 18 | 12 / 14 / 18 |
| Caption / Label | 12 / 14 | 12 / 14 |
| 小 / 普通 / 大按钮 | 13 / 14 / 15 | 13 / 14 / 15 |
| 标签、分段选择 / 表格正文 / 表头 | 13 / 14 / 13 | 13 / 14 / 13 |
| 输入框 | 16 | 15 |
| Markdown h1 / h2 / h3、h4 | 22 / 19 / 16 | 21 / 18 / 15 |
| 计时器 | 32 | 32 |
| 图表刻度 / 地图概览 / 地图署名 | 11 / 10 / 8 | 11 / 10 / 9 |
| 聊天标题五档 | 16 / 18 / 24 / 28 / 32 | 15 / 18 / 24 / 28 / 32 |
| 聊天基础字号中的 20 / 36 | 20 / 36 | 21 / 36 |
| 聊天数字标题四档 | 18 / 24 / 28 / 32 | 18 / 24 / 28 / 32 |

字体家族、字重和行高继续使用已确认方案；代码等宽字体、KaTeX、SVG 显式字号保留。

验证：类型检查、323 项测试、Next 生产构建、QoderWork 构建全部通过。真实 Renderer 桌面读取得到标题 40 / 32 / 24 / 21 / 18 / 15px，Caption 12px、卡片首行标题 14px、计时器 32px；390px 视口标题为 34 / 28 / 24 / 18 / 18 / 15px，卡片场景大标题仍为 18px，页面无横向溢出，gallery 渲染错误为 0。截图：`docs/verification/fliggy-typography-mapped.png`。

用户在实施与实测完成后回复“确认”，本次字体层级映射验收通过。

## 第三步：圆角与间距（最新调整：间距 1 倍，等待用户验收）

用户最新要求取代此前间距除以 2 的决定：**间距直接使用 1 倍数值，圆角继续按 2 倍稿换算**。此规则已同步 AGENTS.md。

| 资产 | 用户提供值 | CSS 像素 |
| --- | --- | --- |
| 圆角 XS / S / M | 6 / 12 / 24（2 倍稿） | 3 / 6 / 12 |
| 间距八档 | 6 / 12 / 18 / 24 / 30 / 36 / 42 / 48（1 倍） | 6 / 12 / 18 / 24 / 30 / 36 / 42 / 48 |

- 旧圆角名：sm → 3px；md / lg → 6px；xl / 2xl → 12px。圆形、full 胶囊和显式数值圆角保留。
- `space()` 每档 6px，参数 1–8 对应 6–48px，0 为无间距；默认 Grid gap 12px。
- 默认层级：紧凑 6px、内部 12px、组内 18 / 24px、区块 36px；表单字段 24px、操作区 42px。卡片默认 padding 24px，窄屏与嵌套卡片 18px。
- 普通组件的正向 padding / gap / margin、聊天外壳间距 Token 恢复为上一版的两倍。圆角、字体、颜色、边框、控件尺寸、负向补偿与定位不随此次间距修改。
- Web / QoderWork 说明、生成提示词、验收示例与构建产物同步更新。

验收地址：`http://localhost:3100/gallery?theme=light#fliggy-layout`。当前截图：`docs/verification/fliggy-layout-spacing-1x.png`。此前截图仅为历史版本。

用户随后提供三个按钮节点，授权进入按钮样式阶段；圆角与间距维持当前配置。

## 第四步：按钮（已实施，等待验收）

来源：[主要大](https://www.figma.com/design/P2lMwWNTqJIBQ1d5I9pTyY/Fliggy-Style?node-id=40995-26240)、[主要小](https://www.figma.com/design/P2lMwWNTqJIBQ1d5I9pTyY/Fliggy-Style?node-id=40995-26246)、[双按钮中次要](https://www.figma.com/design/P2lMwWNTqJIBQ1d5I9pTyY/Fliggy-Style?node-id=40995-26241)。链接为卡片实例，本轮只提取其中按钮，不迁移卡片、输入框或其他资产。

用户明确选择“按本次 Figma：浅紫底、紫色字”，取代此前主要 Button 的紫底白字。全局主色语义及聊天外壳图标按钮保持原配置；此次作用于 Web / QoderWork 共用的 Button。

| 使用场景 | 原稿 | CSS |
| --- | --- | --- |
| 大按钮（md/default、lg）高度 / 圆角 / 字号 | 80 / 24 / 26 | 40 / 12 / 13px |
| 小按钮（sm）高度 / 圆角 / 字号 | 66 / 20 / 28 | 33 / 10 / 14px |
| 主要 solid | 浅紫底、紫字 | #EBEBFF / #6666FF |
| 次要 soft、outline | 灰底、深字，无描边 | #F2F3F5 / #0F131A |

- 按钮内部几何按 2 倍稿：左右 padding 大 16px、小 12px；固定高度通过垂直居中实现，避免叠加 padding 撑高。小按钮最小宽 60px，长文案可扩展。组件专属 10px 圆角按设计保留。
- 页面布局间距仍用已确认的 1 倍档位；双按钮示例使用两列 Grid 与 12px 间距，等宽自适应。保留既有图标 gap 6px。
- 字重沿用已确认的 Medium 500；原稿小按钮为 Semibold，此处遵循现有字重映射。按钮规格覆盖此前通用字号映射中的按钮行。
- hover / pressed 为适配状态（主要底色混入文字色 8% / 16%；次要 5% / 10%），并非 Figma 提供的状态规范。禁用透明度 .4、原生 disabled、键盘焦点与原有动作协议保留。
- danger / success 保留语义配色；ghost 与 IconButton 保留现有样式。深色模式沿用原有深色颜色，尺寸共用新规格。
- 样式位于 `src/lib/components/fliggy-buttons.css`，两端入口共用；Button 描述与生成的 spec / prompt 已同步，参数顺序不变，聊天生成的 Button 自动采用新样式。

实测：主要按钮背景 rgb(235,235,255)、文字 rgb(102,102,255)，次要背景 rgb(242,243,245)、文字 rgb(15,19,26)；大按钮高 40px、小按钮高 33px。点击有反馈、禁用属性正确、Tab 焦点可见；390px 无横向溢出，深浅色切换正常，gallery 渲染错误 0。类型检查、324 项测试、生产构建及 QoderWork 构建通过。

验收：[按钮页面](http://localhost:3100/gallery?theme=light#fliggy-buttons)。截图：`docs/verification/fliggy-buttons.png`。等待本部分验收后继续下一部分。

## 补充：非交互组件的文字回答（已实施，等待验收）

用户提供截图区分回答说明文字与 Intelligent UI。沿用字体 2 倍稿约定：

| 层级 | 用户提供 | CSS 字号 | 字重 | 行高 |
| --- | --- | --- | --- | --- |
| H1 | 42px | 21px | 500 | 140% |
| H2 | 36px | 18px | 500 | 140% |
| H3 | 34px | 17px | 500 | 140% |
| 正文 / 列表 | 34px | 17px | 400 | 170% |

字体为 PingFang SC，normal；沿用设备缺字体时的回退栈。

实际截图中的顶部文案由 Title / Text 生成，因此在助手回答容器内按视觉容器边界应用：卡片、网格、Box、表单、轮播、弹层、表格、Pressable 内部保留原组件字号；其外说明文字使用新规范。Title xl/2xl/3xl 对应主标题 H1，lg 对应 H2，md/sm 对应 H3；普通 Markdown 的 h1/h2/h3 按自身层级。此规则覆盖回答说明文字此前的大标题兼容档，但不改组件内字号，也不改用户消息、聊天输入框或欢迎页。

实现文件：`src/lib/components/fliggy-answer-text.css`。只挂到 Web 助手回答和独立验收示例，不改变组件协议。QoderWork 无此聊天回答容器，本轮不修改它。

实测当前“旅行预算与分账”回答：标题 21px / 29.4px / 500，说明 17px / 28.9px / 400；金额仍 15px，行程参数标题仍 14px。验收示例 H2 18px / 25.2px、H3 17px / 23.8px、列表 17px / 28.9px。390px 视口无横向溢出，渲染错误 0。类型检查、325 项测试及生产构建通过。

验收：[文字回答页面](http://localhost:3100/gallery?theme=light#fliggy-answer-text)。截图：`docs/verification/fliggy-answer-text.png`。等待用户确认本次补充效果。

## 补充：用户消息气泡（已实施，等待验收）

来源：[Figma 40995:26219](https://www.figma.com/design/P2lMwWNTqJIBQ1d5I9pTyY/Fliggy-Style?node-id=40995-26219)。读取到的气泡没有图片资产。

- PingFang SC / Regular 400 / normal；设计稿字号 34px → CSS 17px，行高 140%（23.8px）。
- 文字 #0F131A，纵向渐变背景 #E4E4FF → #EDEDFF。
- 组件 2 倍稿：圆角 36 → 18px，padding 30 → 15px，最大宽度 600 → 300px。短文案随内容宽度，长文案换行，窄屏不超过父容器。
- 在 `src/app/globals.css` 覆盖现有用户气泡类及其 data-multiline 变体；不修改已存消息、发送逻辑、用户输入框、回答排版或全局间距。气泡外部布局继续使用原聊天布局，内部尺寸采用本次组件规格。该指定气泡配色在深浅模式一致。
- 实际现有聊天中读取为 17px / 23.8px / 400、圆角 18px、padding 15px，桌面宽 300px、双行高约 77.6px；390px 视口宽约 291.5px，文字正常换行，气泡及页面无横向溢出。

手机实测截图：`docs/verification/fliggy-user-bubble-mobile.png`。在当前聊天页面即可验收。

## 全集补充：旅行卡片与模块（已实施，等待本批验收）

来源：Figma `P2lMwWNTqJIBQ1d5I9pTyY / 41042:11715`。用户要求包含卡片、模块，并保留已补充的规范。

- 新增 TravelModule / TravelItem / DayBadge / Price / FieldRow，注册到 Web 与 QoderWork，并重新生成 spec 和模型提示词。
- 提供商品、POI、行程、状态、提醒、预算、订单、航班、单/多选、表格和追问组合。控件继续使用既有状态与动作协议。
- 已批准的颜色、字体、按钮、标签、圆角、间距、回答文字和气泡规则优先。原始 open-intelligent-ui 未修改。
- 四组 gallery 验收程序使用真实渲染器。示例价格、行程及图片仅为验收数据；新回答可使用新模块，历史回答不会被重写。
- 390px 预览中，15 个模块均无自身横向溢出；长标题换行正常；卡片圆角 12px，图标实际尺寸 24/14/18px 且全部加载成功。
- 实测刷新反馈、预算 4000→4100 后确认、房型标准房→海景房导致价格 1340→1560、单选与多选确认均成功，浏览器错误日志为空。
- 类型检查、329 项测试、生产构建、QoderWork 构建通过。构建仅出现既有 map import.meta 和上级 lockfile 警告。

手机入口：`http://localhost:3100/mobile-preview.html?view=modules`。完整入口：`http://localhost:3100/gallery?theme=light#fliggy-travel-cards`。截图：`docs/verification/fliggy-modules-mobile.png`。

本批先验收卡片与模块。图片专用裁切、思考动画、表格工具条及应用外壳尚未全部迁移；具体边界见 `docs/figma-module-inventory.md`。按分步约定，等待用户确认再进入下一批。

## 对话背景与无描边模块补充

用户指定对话背景 #F5F5FF，所有输出模块采用无描边白底卡片。已更新浅色主题背景、对话容器及上下滚动渐变、gallery 预览背景；Card/soft Card、所有 TravelModule（含选择/表格/说明/追问）及表格外容器移除外描边并使用白色表面。bordered Box 保留参数兼容但改用白底无描边。输入和选择控件的必要状态、表格内部数据线保持。

在用户当前 390px 手机对话中实测背景为 rgb(245,245,255)，7 个实际输出模块均为 rgb(255,255,255)、0px 边框；gallery 的 130 个卡片也全部通过同样检查。现有回复样式即时生效，无需重新生成。深色主题继续使用原有深色表面。

## 间距修正：保留原场景，按 1 倍就近匹配（最新规则）

此前 `space(n) = n × 6` 会放大原项目 `n × 4` 的空间关系，现改为先计算原 CSS px，再映射至 6/12/18/24/30/36/42/48。0 保留；正值不映射为 0；等距取较小档；大于 48px 的原值作为兼容尺寸保留。

| 原 px | Fliggy CSS px |
|---|---|
| 4 / 8 | 6 |
| 12 | 12 |
| 16 / 20 | 18 |
| 24 | 24 |
| 28 / 32 | 30 |
| 36 | 36 |
| 40 / 44 | 42 |
| 48 | 48 |

语义层级保持原场景：tight 4→6、inner 8→6、group 12→12、group-lg 16→18、section 24→24；control-gap 8→6、field-gap 24→24、action-gap 40→42。卡片原 padding 20→18，嵌套/窄屏原 16→18。静态组件间距与原项目逐选择器对比，补齐 check、choice、pie legend 的就近映射。TravelModule 内分组复用 group、图文间距复用 group-lg。按钮、用户气泡独立批准的内部规格保留。

模型提示词、两端组件描述及 gallery 已同步参数含义。类型检查及 331 项测试通过；手机实际对话读取 section/group/inner 为 24/12/6px，卡片 padding 18px。截图 `docs/verification/fliggy-spacing-nearest.png`。此段覆盖前文旧的“每档 6px”实现及卡片 24px 内边距记录。

## 回答编排与紧凑任务模块

移除“短介绍后全部组件化”“只要出现数字/列表/步骤就做工具”的倾向，替换为：

- 独立 Text/Markdown 说明、完整任务工具、结果解释相互穿插，普通解释不包成 notice/evidence 卡。
- 共享输入、计算和结果属于一个 Card/TravelModule，内部用 Row/Col/Divider；不能按输入、结果、操作类型拆成多个关联卡片。
- 默认 2–4 个关键控件、最多 3 项简短结果；4 个控件时结果只留 1–2 行。更多指标必须按需展开或分区切换；保留共享状态、关键结果和错误提示。
- 以 390px 手机约一屏（600 CSS px 内容）为软目标，不设固定裁切高度、不缩小字体。普通紧凑工具不强行加标签页。

新增 `exampleCompactBudget`，作为模型优先示例和真实 Renderer 验收程序。手机默认模块高约 281px，明细展开后修改住宿费为 5000，合计变为 6800，人均 2267，外部说明同步变为超支解读；收起后输入和计算保留。333 项测试、类型检查通过。

验收：`http://localhost:3100/mobile-preview.html?view=compact`；截图 `docs/verification/fliggy-compact-answer.png`。规则适用于后续生成，历史回复不自动重写。通过提示词与示例引导生成结构，不是强制截断模型内容的后处理器。

当前 deepseek-v4-pro 实际请求“做个旅行预算和分账工具，人数天数可调，标出超支”：第二次结果为 `Col([intro, tool, note])`，仅一个 TravelModule；默认人数/天数/预算三个输入、总额/人均/预算状态三个结果，四项费用明细由 `$details=false` 默认收起，配有展开/收起动作和复制结果。原始输出保存于 `docs/verification/compact-budget-model-output.txt`。生产构建与 QoderWork 构建通过。此单次模型结果证明规则已进入实际请求，但不保证所有后续生成完全一致。

## 通用滑块、选择状态与独立表格

依据 40995:26239 / 26246 / 26232。Slider 的细轨道和进度全局生效，不再仅限 budget 模块；6px 轨道、21px 主体、原稿三条握纹 SVG 保留完整根尺寸后整体缩放 0.5（含阴影的实际图像 30.5×31.25px）。原生 range 保留拖动、键盘及值绑定。

Checkbox 和 RadioGroup 各变体统一 21px 圆形标记：未选中白底 #D2D4D9 描边，选中 #6666FF 底和白勾；原生 input 保留语义与焦点。Figma Code Connect 指向未安装的 `@ali/fliggy-design/Checkbox`，使用现有原生控件适配状态，没有安装额外组件库。两种状态的独立实例截图已核对。

Table 新增尾部可选 title/headerPosition 参数，保持旧 columns/rows 调用兼容；left 模式第一列使用 scope=row 表头。表格自身圆角沿用已批准 12px，网格 #D2D4D9，表头 #F7F8FA；带原 Figma 16px 复制/全屏图标，复制可用于非安全 LAN 环境，全屏采用可 Escape 关闭、带焦点约束的原生 dialog。独立表格不套卡片，旧 TravelModule table/table-left 外壳去 padding/背景；独立 Table 生成规则已更新。此处网格边线是最新用户指定表格规范，不受普通卡片无描边限制。

手机实测：滑块 Home/End 分别为1000/10000；复选与单选可切换；复制反馈“已复制”；全屏打开和关闭正常；表格无 Card 祖先、无横向页面溢出；三个图像资产均加载成功，表格图标16×16px。入口 `http://localhost:3100/mobile-preview.html?view=controls`。

### 表格边线修正

按用户截图修正左侧外框与首列单元格边框叠加：使用 separate/0 间隔，由外框绘制周边，单元格只绘制内部上边和右边，末列不再绘制右边。外框和网格统一由 #D2D4D9 调淡至 #E7E8ED，全屏同步。手机实际两类表格首列左边框为 0px，外框颜色 rgb(231,232,237)，无溢出；截图 `docs/verification/fliggy-table-border-fix.png`。

## 手机顶部与输入区域

来源：CHVhiSaLjChzWOMTAtnpZe / 252:73、249:439。顶部45px，浅紫透明渐变、12px上圆角、原始拖动提示/历史/新建SVG；保留默认历史面板和新建动作，仅替换图形与样式。拖动提示为装饰，不新增底部弹层拖动行为。

输入区沿用2倍组件几何：50px最小高度、12px圆角、24px图标、17px输入文字；白色渐变输入表面，下方浅紫渐变。Figma导出的背景图定位值异常，使用同一下载纹理作为cover背景，叠加稿中的90%白色渐变。SVG根尺寸不变，外层整体缩放0.5；语音图标方向通过外层旋转与参考截图对应。

用户明确选择未接入能力禁用并标注：语音/拍照/附件使用disabled和可访问名称，底部显示“暂未接入”；placeholder采用“发消息…”而不是暗示可用的“按住说话”。有文字时显示发送，生成中显示停止；复用useThread的processMessage/cancelMessage，不改变模型、保存、消息协议。Shift+Enter换行、中文输入法回车保护；最大输入高度120px后内部滚动。

实际发送测试收到“发送正常”；多行输入测试值为两行、高48px；历史面板和新建对话可用。手机测量顶部390×45px，输入区372×50px，两个SVG图标实际24×24且加载成功。类型检查和生产构建通过。截图 `docs/verification/fliggy-mobile-shell.png`。测试新建了一条“界面验收：请只回复‘发送正常’”本地对话。

### 输入区精简

按最新批注移除拍照按钮和底部“语音、拍照、附件暂未接入”说明。语音、附件保留禁用状态和可访问提示；文字发送/停止保持原逻辑，发送失败时才显示错误提示。

## 新聊天欢迎页

按 P2lMwWNTqJIBQ1d5I9pTyY / 40995:26267 替换原英文欢迎页。使用用户补充的完整飞猪 PNG，45×45px 等比显示；推荐星标为 Figma 原 SVG，根尺寸保留、整体缩放 0.5 为12px。两行标题24px/500/1.4，分类15px/500，推荐14px/1.7，圆角12px；布局间距沿用已批准1倍档位临近匹配。顶部与输入区保留已确认版本，不重复加入稿中的顶部留白或底部占位。

“帮我想”三条推荐与稿一致；稿中未展开的“帮我订/帮我办”暂配旅行咨询示例，切换分类更新推荐，点击复用 useThread.processMessage 发送普通消息，不代表已接入订票/订单操作。自定义内容放在 AgentInterface.Welcome 插槽，仍由原组件决定空会话显示。390px 手机预览验证分类切换、四张可见图片加载和尺寸正确，类型检查通过。截图：docs/verification/fliggy-welcome.png。

## 紧凑紫色标签

最新参考 CHVhiSaLjChzWOMTAtnpZe / 254:191 覆盖此前灰底深字标签规则。Figma 为60×32矢量节点，填充为 #EBEBFF / #6666FF；沿用2倍组件换算，动态 Badge 实现16px高、10px字/14px行高、水平5px垂直1px内边距、胶囊圆角。文本保持动态，不使用写死“标签”二字的矢量图片；可选图标缩至10px。所有旧color变体统一外观，保持历史回答兼容。示例及模型提示中的旧灰色说明同步修正。

390px模块预览实测标签高度16px、字号10px、背景rgb(235,235,255)、文字rgb(102,102,255)。截图 docs/verification/fliggy-labels.png。

## Thinking 渐变动画

参考 P2lMwWNTqJIBQ1d5I9pTyY / 40995:26220。使用原生CSS渐变，无图片资产：首行紫/棕30%透明度渐变至橙色全透明，后两行12%；2倍稿落地21px高、9px圆角、6px行距、12px上留白，首行438/690比例。每行320ms依次从左到右裁切展开，全部完成后1060ms起以1600ms周期向右扫光。prefers-reduced-motion下取消动画显示三行。

限定在原 MessageLoading 中覆盖外观，保留库的状态显示/撤销和可访问Working状态文本，不修改其他工具活动或历史加载。真实界面测试创建“界面验收：给我三个杭州周末散步的地点，简单介绍即可。”对话，核对三行21px高度、0/320/640ms展开延迟以及1060ms扫光延迟；截图 docs/verification/fliggy-thinking.png。

## 核对清单勾选图标统一

用户截图中的清单为 Pressable + Row + Icon，而非 Checkbox，旧图标是普通 circle/check-circle 系列。为这些图标提供语义标记，仅在有 aria-pressed 的可点击行首复用单选/多选的21px圆形样式：选中 #6666FF 底白勾、未选中白底 #D2D4D9 圈；普通图标不受影响。保留多项独立选择、完成划线和统计。

实际酒店清单验证6个选中/2个未选中，尺寸21px；点击取消后空格键重新选中，最终恢复6/8。类型检查通过。截图 docs/verification/fliggy-checklist.png。

## 模块标题统一 H3

用户指定模块 title 使用34px H3，沿用2倍稿换算为17 CSS px、500字重、140%行高。TravelModule主标题及普通Card首个Title（含首行Title）统一；模块内部条目名称/数据字号保留。真实“​​三个杭州周末散步地点”主标题实测17px/500/23.8px，截图 docs/verification/fliggy-module-h3.png。

## 历史侧栏中文化

移除手机侧栏顶部OpenUI区域，Threads改为真实中文标题“历史对话”，新建按钮改为 #6666FF 紫底白字“新聊天”。通过Sidebar插槽复用原ThreadList，按钮调用原switchToNewThread，保留历史与新建会话逻辑。类型检查通过，手机预览核对。

## 地图与行程联动（2026-10-21）
新增 ItineraryMap(title, stops, subtitle)，复用现有地图，通过内部选中状态将地图标记与唯一 stop id 对应。行程点横排横滑，点击标记/行程点双向同步详情；上一站/下一站，完整行程默认折叠。当前不展示导航路线，避免误用驾车线路表达步行行程。更新组件注册、生成规范及两份模型提示词。

原提示词“杭州西溪喜来登酒店出发再回到酒店今天一天的行程怎么玩？”在手机预览新建聊天重新发送，模型生成一个5站合并模块。实测行程第2站→地图选中第2站；地图第4站→详情及横排第4站同步。横排容器宽307px、内容1015px，overflow-x:auto，选择第4站后scrollLeft566px。类型检查及5项解析/坐标回归测试通过。旅行内容与坐标准确性未作人工核实。

## 地图来源收起（2026-10-21）
所有地图默认隐藏底部整块来源文字；点击现有信息按钮展开来源与使用说明，再次点击收起。沿用原生 AttributionControl，动态来源及链接保留。手机三亚行程实测默认display:none，展开后来源链接可见；类型检查通过。

## 表单输入行 · Figma 263:1342（2026-10-21）
参考 CHVhiSaLjChzWOMTAtnpZe / 263:1342。项目未安装 Code Connect 指向的 @ali/fliggy-design/Input，复用现有有状态 Input 与 FieldRow。新增 fliggy-form-fields.css：左侧78px浅灰标题14px/400/1.4；右侧无外框输入14px/500/20px，中灰字；输入内容区域21px。间距继续按此前1倍规则（列间距与上下内边距24px），分隔线0.5px。嵌套Input的重复标签视觉隐藏但保留原生可访问标签；保留键盘焦点与说明/报错。单独带标签Input同样采用横排样式，聊天输入框不受影响。生成规范推荐FieldRow纵向组成表单。

对话实测：生成联系人、联系方式、孩子年龄、狗狗体重四个FieldRow；孩子5→8、体重12→9.5后摘要即时更新。实际输入14px/500/#5c5f66/21px高/0边框，各行标题与输入的顶部坐标一致，行高69.5px（含48px上下间距）。截图docs/verification/fliggy-form-fields.png。类型检查通过。

## 表单状态与间距修正（2026-10-21，覆盖上一节间距规则）
核对已填写263:1342、未填写268:1399、激活268:1512。本组件内部间距改按2倍稿换算，上下12px、列间距12px，常规行45.5px（包含0.5px线）；相邻FieldRow不叠加父容器间距。placeholder为#919499/500；已填值#5c5f66/500；激活隐藏placeholder、黑色原生caret，无紫色焦点外框。保留错误信息#ff5745/12px。
实际生成表单核验四行均45.5px、padding12px、列间距12px，空字段/已填写/激活状态同时展示，截图docs/verification/fliggy-form-states.png。其他组件的全局1倍间距规则不变。

## 标签圆角与字重更新（2026-10-21）
依据Untitled282:1570（60×32、9px圆角、20px/500、28px行高、左右10px上下2px）。2倍换算：16px高、4.5px圆角、10px/500、14px行高、1px 5px内边距。修改通用Badge，所有color变体一致。租车真实对话三个标签实测16px高/4.5px圆角/500字重。截图docs/verification/fliggy-badge-rounded.png。

## 可组合机舱选座（2026-10-21）
组件包已按Fliggy就近映射接入生成库，新增8个组件及4个预设，支持自定义座位组/多过道/设施/舱段。映射和验证见 `fliggy-cabin-mapping.md`。真实对话已验证195座预设及28座自定义双过道，选座摘要联动、人数限制、出口排禁用、键盘取消通过。等待用户验收。

## 国内航司结构配置扩充
图库作为结构化依据：新增国航A320158、南航32H166、海航A320neo172三个CabinView预设，保留国泰32P195。使用原机舱组件组合并支持本地选座，不展示图库图片。来源、未知字段与验证见fliggy-airline-atlas.md。真实南航166座生成与31A/31B联动通过，等待用户验收。

## 机舱推荐联动修复
新增按人数/舱等/偏好/出口条件校验的推荐组合，同源驱动文字理由、座位高亮、自动定位、点击预选和选中摘要；避免文字建议与图分离。流式不完整数据保护已加。真实南航32H对话验证通过；详情见fliggy-cabin-mapping.md。旧对话静态文字需重新生成才能采用新提示词。
