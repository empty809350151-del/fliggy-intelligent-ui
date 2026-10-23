import colors from "@/lib/fliggy-colors.json";
import type { Program } from "./programs";

export const fliggyAnswerProgram: Program = {
  id: "fliggy-answer-text",
  title: "飞猪 · 文字回答验收",
  note: "非交互组件的回答文字：2 倍稿换算 H1 21 / H2 18 / H3 17px，500 / 1.4；正文与列表 17px，400 / 1.7。组件内部沿用已验收规格。",
  code: `root = Col([Col([Title("旅行预算与分账 · H1", "xl"), Text("调整人数和天数，记下每一笔支出，人均分摊实时算出；超过预算会自动标红。")], 2), Title("安排你的旅行 · H2", "lg"), Title("预算说明 · H3", "md"), Markdown("正文与列表使用 17px 字号和 1.7 倍行高。\\n\\n- 记录交通与住宿费用\\n- 为同行伙伴计算分摊\\n\\n## Markdown 二级标题\\n\\n### Markdown 三级标题"), Card([Title("组件内标题仍为 14px", "md"), Text("组件内正文仍为 15px。"), Input($budget, "输入预算"), Button("检查交互", @Set($checked, true)), Text($checked ? "交互正常" : "等待点击", "sm")], "outline", 4, 3)], 3)
$budget = ""
$checked = false`,
};

export const fliggyButtonProgram: Program = {
  id: "fliggy-buttons",
  title: "飞猪 · 按钮验收",
  note: "主要按钮浅紫底紫字，次要按钮灰底深字。大按钮 40px / 圆角 12px / 字号 13px；小按钮 33px / 圆角 10px / 字号 14px。组件按 2 倍稿换算，布局间距沿用 1 倍规则。",
  code: `root = Card([content], "outline", 4)
content = Col([Title("按钮样式", "lg"), Caption("主要大 · 独立操作"), Button("查看旅行方案", @Set($status, "主要大按钮点击正常"), "solid", null, "lg", null, false, true), Caption("主要小 · 紧凑操作"), Row([Button("确认", @Set($status, "主要小按钮点击正常"), "solid", null, "sm")], 2, null, "end"), Caption("双按钮 · 左侧次要 / 右侧主要"), pair, Caption("默认尺寸与禁用状态"), Row([Button("默认按钮", @Set($status, "默认按钮点击正常")), Button("暂不可用", null, "solid", null, "lg", null, true), Button("次要禁用", null, "soft", null, "lg", null, true)], 2, null, null, true), Text($status, "sm", "muted")], 3)
pair = Grid([Button("重新选择", @Set($status, "已重新选择"), "soft", null, "lg", null, false, true), Button("立即下单", @Set($status, "主要按钮点击正常（仅演示，未下单）"), "solid", null, "lg", null, false, true)], 2, 0, 2)
$status = "点击按钮检查交互；禁用按钮不可操作"`,
};

export const fliggyColorProgram: Program = {
  id: "fliggy-colors",
  title: "飞猪 · 颜色验收",
  note: "第一步：浅色颜色已验收。字体跟随当前迁移版本；下方色板为 Figma 原始值，深色配色尚未迁移。",
  code: `root = Col([Title("Fliggy 色彩", "lg"), Text("品牌、状态、文字与背景；请检查按钮点击、输入框聚焦及状态标签。", "sm", "muted"), sample, swatches], 4)
swatches = Grid([${Object.entries(colors).sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => `Col([Box([Text("${value.toUpperCase()}", "sm")], "col", 0, 3, "${value}", "md"), Caption("\`${name}\`")], 2)`).join(",")}], 4, 150, 3)
sample = Card([Title("组件颜色预览", "md"), Text("主要文字 #0F131A", "md", "ink"), Text("次要文字 #5C5F66", "sm", "muted"), Text("辅助说明 #919499", "sm", "faint"), Row([Badge("正向反馈", "success"), Badge("警示", "warning"), Badge("危险操作", "danger"), Badge("辅助高亮", "purple")], 2, null, null, true), Input($destination, "输入目的地"), Row([Button("确认颜色", @Set($confirmed, true), "solid"), Button("次要按钮", @Set($confirmed, false), "outline"), Button("柔和按钮", @Set($confirmed, false), "soft")], 2, null, null, true), Text($confirmed ? "按钮交互正常 · 等待你的验收" : "点击按钮检查交互", "sm", "muted")], "outline", 4, 3)
$destination = ""
$confirmed = false`,
};

export const fliggyTypographyProgram: Program = {
  id: "fliggy-typography",
  title: "飞猪 · 字体验收",
  note: "Figma 246:149 · 按 2 倍稿换算 · 苹方 SC · Regular 400 / Medium 500 · 保留原项目字号层级，32 / 40px 为兼容档；窄屏为 28 / 34px。",
  code: `root = Col([Title("最大标题 · 40px / 窄屏 34px", "3xl"), Title("大数字 12,800 · 32px / 窄屏 28px", "2xl"), Title("出发，去遇见美好 · h1 24px", "xl"), Title("探索下一站 · h2 21px", "lg"), Title("精选旅行灵感 · h3 18px", "md"), Title("副标题 15px · Medium 500", "sm"), Text("正文 15px · Regular 400。沿着湖边慢慢走，发现城市里的风景与烟火气。这里展示长段落的换行与 1.7 倍行高，方便检查中文、English 和数字 0123456789 的阅读效果。"), Text("正文强调 15px · Medium 500", "md", "ink", "medium"), Text("辅助正文 14px · Regular 400", "sm"), Text("辅助正文 14px · Medium 500", "sm", "ink", "medium"), Text("说明文字 12px · Regular 400", "xs"), Caption("注释 Caption 12px · Regular 400"), sample], 3)
sample = Card([Title("卡片标题 14px", "md"), Text("卡片副文案 13px · 标准行高 1.4", "sm"), Text("卡片内正文 15px，段落行高 1.7。检查真实组件组合中的层级与阅读感受。"), Row([Badge("浅紫底紫字标签"), Badge("杭州 · Hangzhou", "success")], 2, null, null, true), Label("目的地 · 14px Medium"), Input($destination, "中文、English、123"), Button("确认字体效果", @Set($confirmed, true), "solid"), Text($confirmed ? "交互正常 · 等待你的字体验收" : "输入目的地并点击按钮测试", "sm", "muted")], "outline", 4, 3)
$destination = ""
$confirmed = false`,
};

export const fliggyLayoutProgram: Program = {
  id: "fliggy-layout",
  title: "飞猪 · 圆角与间距验收",
  note: "圆角按 2 倍稿：XS 3 / S 6 / M 12px；间距按 1 倍 6–48px；保留原 4px 参数含义，就近匹配，等距离取小档。",
  code: `root = Col([Title("圆角与间距", "lg"), radii, Title("八档间距", "md"), spaces, sample])
radii = Grid([Box([Text("XS · 3px")], "col", 1, 4, "surface", "sm"), Box([Text("S · 6px")], "col", 1, 4, "surface", "md"), Box([Text("M · 12px")], "col", 1, 4, "surface", "xl")], 3, 140, 2)
spaces = Col([${[1.5,3,4.5,6,7.5,9,10.5,12].map(n=>`Row([Text("${n*4}px", "sm"), Box([], "col", 0, 0, "ink", "sm", false, 24, 24), Box([], "col", 0, 0, "ink", "sm", false, 24, 24)], ${n})`).join(",")}], 2)
sample = Card([Title("杭州周末游", "md"), Text("卡片圆角 12px；内边距 18px；内容间距 12px。"), Row([Badge("浅紫底紫字标签"), Badge("两天一晚")], 2, null, null, true), Input($destination, "输入目的地"), Row([Button("检查交互", @Set($checked, true), "solid"), Button("重置", @Set($checked, false), "outline")], 2, null, null, true), Text($checked ? "交互正常 · 等待你的验收" : "点击按钮检查圆角和间距", "sm", "muted")], "outline", 4, 3)
$destination = ""
$checked = false`,
};
