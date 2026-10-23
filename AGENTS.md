# 本对话的持久工作范围规则

- 本对话后续所有项目工作均在 `/Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/fliggy intelligent ui` 中完成，运行命令前显式设置该工作目录。
- 不得修改原始项目 `/Users/tianzhongyi/Documents/ChatGPT/Intelligent UI/open-intelligent-ui` 中的任何文件、配置或 Git 状态。
- 上下文压缩、会话恢复或交接后，必须重新读取本文件并继续遵守此规则；在交接摘要中保留工作目录和原项目不可修改的约束。
- 只有用户明确更改工作范围时，才可调整此规则。
- 设计资产迁移必须分步进行：每部分实现并实际测试后等待用户确认，再进入下一部分。当前进度与验收范围见 `docs/fliggy-design-migration.md`，恢复上下文时一并读取。
- 用户最新要求：字体与圆角继续按 2 倍稿换算，圆角落地为 3/6/12 CSS px；间距改为 1 倍，直接使用 6/12/18/24/30/36/42/48 CSS px，不除以 2。
- 间距最新映射：保留原项目 gap/padding 参数的 4px 基准，先算原值再就近匹配上述 1 倍档位，禁止直接乘 6。等距离取小档，0 不变，大于 48px 保留兼容值。语义 tight/inner/group/group-lg/section 为 6/6/12/18/24px；普通卡片原 padding 20→18px；独立确认的按钮和用户气泡内部规格保留。
- 字号迁移保留原项目层级、使用场景和窄屏规则，统一 CSS px 后就近映射。超过 Fliggy 24px 上限的原字号保留为兼容档，不压平为 24px，也不称为 Fliggy 原始 Token。已批准映射与实测见迁移记录。
- 按钮阶段用户最新确认：主要 Button 改用 Figma 浅紫底 #EBEBFF、紫字 #6666FF，取代此前这类按钮的紫底白字；次要 Button 灰底深字。完整规格与范围见迁移记录。
- 回答文字与交互组件排版分开：组件外 H1/H2/H3 为 21/18/17 CSS px、500、1.4 行高；正文/列表 17px、400、1.7 行高（用户提供 42/36/34/34，沿用 2 倍稿换算）。交互组件内部仍遵守此前映射。
- 用户消息气泡参考 Figma 40995:26219：17px/400/1.4，深色字 #0F131A，#E4E4FF→#EDEDFF 纵向渐变，圆角 18px、内边距 15px、最大宽 300px（组件按 2 倍稿换算）。
- 全集 Figma 41042:11715 的后续迁移包含卡片与模块，但不能覆盖此前已补充规则。组件覆盖与剩余范围见 `docs/figma-module-inventory.md`；卡片模块本批已实现，待用户验收，不能宣称整张全集已全部完成。
- 最新表面规则：浅色对话背景 #F5F5FF；Intelligent UI 的 Card（含 soft）、TravelModule 和表格外容器均白底无外描边，显式 bordered Box 也使用无描边卡片表面。保留输入框焦点、选择状态及表格内部数据分隔线。
- 回答组织：说明/判断/过渡在卡片外，文字与工具穿插。按独立用户任务分组，共享输入、计算、结果和动作放同一个 Card/TravelModule，禁止按组件种类拆卡。默认只露 2–4 个关键控件、简短结果；手机内容尽量约一屏，过长时用模块内展开、分区切换或步骤导航，保留状态与结果，不能裁切或缩小已批准字号。普通解释不强制 UI 化。
- 通用 Slider 参考 40995:26239：6px 轨道、21px 滑块主体，紫色已选轨道，原 SVG 按整体 0.5 缩放显示。Checkbox/RadioGroup 选中紫底白勾、未选中灰色空心圆。独立 Table 直接展示，不包额外 Card/TravelModule，保留表格自身网格/边线、灰色表头与复制/全屏操作；这是表格对“白底无描边卡片”规则的最新例外。
- 手机聊天外壳参考 Untitled 文件 CHVhiSaLjChzWOMTAtnpZe 的 252:73（顶部）和249:439（输入区）。顶部保留历史/新建动作；用户明确要求语音、拍照、附件先禁用并标注，保留文字发送。不得暗示这些未接入能力可用。
- 输入区最新调整：移除拍照按钮和底部“语音、拍照、附件暂未接入”说明；语音和附件仍禁用并保留可访问名称/悬浮提示，发送失败时仍显示错误。

# OpenUI: guide for coding agents

This project is built with [OpenUI](https://www.openui.com). Before changing it, read the maintained OpenUI skill for coding agents published at [thesysdev/skills](https://raw.githubusercontent.com/thesysdev/skills/refs/heads/main/skills/openui/SKILL.md).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

- 新聊天页使用 Figma 40995:26267：用户提供的飞猪形象、两行中文欢迎语、帮我想/帮我订/帮我办分类推荐。保留已批准顶部和输入框；推荐仅发送普通对话，不暗示订单能力已接入。详细规格见迁移记录。
- 标签最新规则取代灰底深字：参考 CHVhiSaLjChzWOMTAtnpZe / 254:191，Badge 统一浅紫底 #EBEBFF、紫字 #6666FF，2倍稿落地16px高、10px字/14px行高、胶囊圆角；保留旧color参数兼容，所有色型使用同一外观。
- Thinking 等待态参考 40995:26220：三条渐变条，2倍稿落地21px高/9px圆角/6px行距，首行宽约63.48%，后两行全宽。逐行320ms从左向右展开，1060ms后每1600ms从左向右扫光；减少动态效果偏好下静态展示。保留原加载生命周期与状态可访问语义，不展示默认Working图标/文字。
- 核对清单的 Pressable 行首圆形选择图标也必须与 Checkbox/RadioGroup 一致：21px、选中紫底白勾、未选中白底灰圈；保留逐项切换、划线及统计。不改变非选择用途的普通图标。
- 模块主标题统一H3：设计稿34px按2倍换算为17 CSS px，500字重、1.4行高。适用于TravelModule标题与Card首个标题（含首行标题），不覆盖模块内部条目标题和数据字号。
- 手机历史侧栏去掉顶部OpenUI区域，分组名称为“历史对话”，底部操作为紫底白字“新聊天”，保留历史记录选择与新建会话功能。
- 聊天项目固定浅色主题，不再跟随操作系统或历史主题偏好切换暗色；主聊天移除主题切换入口，嵌入与手机预览同步使用浅色。
- 地图与行程组合使用 ItineraryMap：一份 stops 数据（唯一 id、名称、坐标、时间、说明）驱动地图及详情，双向联动。行程点横排横滑，默认展开当前站详情，完整行程折叠；同一行程不再拆成独立 Map 与 TravelModule。地图底图位置为模型提供坐标，不能宣称精确导航/实时交通。
- 表单参考Untitled263:1342：FieldRow与带标签Input用横排左标题/右无框输入，标题14px浅灰400、值14px中灰500/20px行高、左列78px；本表单内间距按最新状态稿2倍换算：上下12px、列间距12px、行高约45px，相邻表单行不叠加容器gap；其他组件间距规则不变。未填写提示浅灰500，已填写中灰500，激活隐藏placeholder、黑色原生光标，无紫色外框。嵌套Input不重复显示标签，保留可访问名称。
- 标签最新规格覆盖旧胶囊规则：Figma Untitled282:1570，2倍换算为16px高、10px/14px、500字重、4.5px圆角、1px/5px内边距，仍浅紫底#EBEBFF/紫字#6666FF。

- 值机选座使用 CabinView 及 CabinRow/Section/Exit/Services/Note/Divider/Spacer 数据块；依据用户提供的机型配置组合，不凭机型名编造航司真实布局。设计映射见 docs/fliggy-cabin-mapping.md。selected 使用 reactive 可选数组（optional 放在 reactive 内），支持摘要联动；白底无描边、紫色选座、360px内滚动。仅本地预选，不能宣称实时余位/占座/值机成功。

- 所有中文回答与组件文案统一使用简体中文，包括机舱预设、设施、座位说明和可访问名称；保留机型代码与座位标识。

- 航司机舱图库仅作为组件化结构依据，不直接展示原图。CabinView新增airchinaA320158/csairA32032h/hainanA320neo172，连同cathay32p分别对应国航158、南航32H166、海航布局1 172、国泰32P195。保留原图跳号/座位字母/舱段/设施；海航公务舱排号原图未标，不编造。详见docs/fliggy-airline-atlas.md。

- 机舱推荐与UI必须同源：CabinView passengers/preference/cabin/suggestions承接需求；suggestions为具体座位ID数组和理由，组件验证同排同侧、人数、舱等、禁用/出口/窗位条件后高亮并定位，点击组合预选，摘要绑定同一$seats。不得在卡片外另写不联动的静态具体座位推荐；机型不明先澄清，不按航司猜机型。
