import { exampleCompactBudget } from "@/lib/prompt-options";
import type { Program } from "./programs";

export const fliggyModulePrograms: Program[] = [
  { id: "fliggy-controls", title: "飞猪 · 滑块、选择与独立表格", note: "通用控件样式；表格直接展示，可复制和全屏。", code: `root = Col([Slider($budget, 1000, 10000, 100, "当前预算", "¥", [{value:1000,label:"1000"},{value:5000,label:"5000"},{value:10000,label:"10000"}]), Checkbox($breakfast, "含早餐"), Checkbox($cancel, "免费取消"), RadioGroup($room, ["标准房", "海景房"], "房型", "list"), Text("选择：" + $room + " · 早餐：" + $breakfast, "sm"), Table(["项目", "方案 A", "方案 B"], [["房型", "标准房", "海景房"], ["早餐", "包含", "包含"], ["价格", 670, 780]], "住宿方案对比", "left")])
$budget = 4000
$breakfast = true
$cancel = false
$room = "标准房"` },
  { id: "fliggy-compact-answer", title: "飞猪 · 文字穿插与完整工具", note: "文字说明 → 一个紧凑预算工具 → 动态解读；明细在同一模块内展开。", code: exampleCompactBudget },
  {
    id: "fliggy-travel-cards",
    title: "飞猪 · 卡片与概览",
    note: "Figma 全集：图文推荐、POI、行程、状态与提醒。示例图片来自设计稿；价格及行程仅用于样式验收。",
    code: `root = Col([product, poi, itinerary, status, notice], 3)
product = TravelModule([TravelItem("海岛度假酒店 · 示例", "海景房 · 早餐 · 示例住宿方案", null, [Row([Badge("海景"), Badge("可取消")], 2), Price(670, "¥", " / 晚，示例")], [Button("查看", @Set($message, "已查看示例酒店"), "solid", null, "sm")], true, "asset:fliggy-poi")], "product", "酒店 / 商品推荐")
poi = TravelModule([TravelItem("海岛观景点", "适合漫步与看日落", null, null, null, false, "asset:fliggy-poi"), TravelItem("一个很长的景点名称，检查手机上是否自然换行且不会挤出卡片", "描述信息保持在图片右侧", null, null, null, false, "asset:fliggy-poi")], "poi", "POI 概览")
itinerary = TravelModule([TravelItem("解放碑步行街 → 洪崖洞", "下午漫步，傍晚欣赏江景。", [DayBadge(1, "06/17")]), TravelItem("磁器口古镇 → 二厂文创公园 → 李子坝", "按体力安排，中间预留休息。", [DayBadge(2, "06/18")])], "itinerary", "行程概览")
status = TravelModule([Text($message, "sm")], "status", "行程状态", "点击右侧刷新检查交互", null, @Set($message, "状态已刷新"))
notice = TravelModule([Text("热门街区人流量大，建议避开周末高峰，保管好随身物品。", "sm", "muted")], "notice", "提醒")
$message = "等待查看或刷新"`,
  },
  {
    id: "fliggy-order-form",
    title: "飞猪 · 订单与表单模块",
    note: "订单、航班、字段行与预算调整；示例操作不创建真实订单。字段、金额和滑块保持联动。",
    code: `root = Col([budget, order, flight, Text($message, "sm")], 3)
budget = TravelModule([Slider($budget, 1000, 10000, 100, "当前预算", "¥", [{value:1000,label:"¥1000"},{value:6000,label:"¥6000"},{value:10000,label:"¥10000"}]), Text("预算调整为 ¥" + $budget, "sm", "muted")], "budget", "预算调整", "仅演示预算计算", [Button("确认预算", @Set($message, "已确认预算 ¥" + $budget), "solid", null, "lg", null, false, true)])
order = TravelModule([FieldRow("出行人", [Input($name, "出行人姓名", "text", "请输入姓名")], "仅为本地演示，请勿填写证件号码"), FieldRow("房型", [Select($room, ["标准房", "海景房"], "房型")]), Grid([Box([Text("入住时间", "sm"), Text("06/17", "md", "ink", "medium")], "col", 1, 2, "surface", "xl"), Box([Text("离店时间", "sm"), Text("06/19", "md", "ink", "medium")], "col", 1, 2, "surface", "xl")], 2, 0, 2), FieldRow("预计费用", [Price($room == "海景房" ? 1560 : 1340, "¥", " / 2晚")])], "order", "住宿订单 · 示例", "费用为验收数据", [Grid([Button("重新选择", @Set($room, "标准房"), "soft", null, "lg", null, false, true), Button("检查方案", @Set($message, $name + " · " + $room + "（未下单）"), "solid", null, "lg", null, false, true)], 2, 0, 2)])
flight = TravelModule([Grid([Col([Title("09:00", "lg"), Text("杭州萧山", "xs")], 1), Col([Text("直达", "xs", "muted"), Divider()], 1), Col([Title("11:30", "lg"), Text("重庆江北", "xs")], 1)], 3, 0, 2), Row([Text("经济舱 · 示例", "xs", "muted"), Spacer(), Price(580)], 2)], "flight", "航班方案", "时间及价格仅用于展示")
$budget = 4000
$name = "旅客"
$room = "标准房"
$message = "修改预算或房型，检查联动"`,
  },
  {
    id: "fliggy-choice-modules",
    title: "飞猪 · 单选与多选澄清",
    note: "复用原生单选与多选控件，支持键盘操作；确认按钮读取已选择内容。",
    code: `root = Col([single, multiple, Text($result, "sm")], 3)
single = TravelModule([RadioGroup($style, ["轻松休闲", "城市探索", "亲子活动"], "旅行偏好", "list")], "choices", "你偏好哪种旅行方式？", "单选", [Button("确认单选", @Set($result, "选择：" + $style), "solid", null, "sm")])
multiple = TravelModule([Checkbox($breakfast, "含早餐"), Checkbox($cancel, "免费取消"), Checkbox($view, "海景房")], "choices", "需要哪些酒店服务？", "可多选", [Button("确认多选", @Set($result, "早餐：" + $breakfast + "；免费取消：" + $cancel + "；海景：" + $view), "solid", null, "sm")])
$style = "轻松休闲"
$breakfast = true
$cancel = false
$view = false
$result = "等待确认"`,
  },
  {
    id: "fliggy-content-modules",
    title: "飞猪 · 表格与内容模块",
    note: "上目录/左目录表格、图片组合、说明及追问。布局使用已确认的间距与圆角；功能由现有组件提供。",
    code: `root = Col([table, leftTable, evidence, media, followup, Text($result, "sm")], 3)
table = TravelModule([Table(["方案", "住宿", "交通", "合计"], [["轻松游", 1200, 800, 2000], ["舒适游", 1800, 1000, 2800]])], "table", "预算对比 · 示例")
leftTable = TravelModule([Table(["项目", "方案 A", "方案 B"], [["房型", "标准房", "海景房"], ["早餐", "包含", "包含"], ["费用", 1340, 1560]])], "table-left", "项目目录在左")
evidence = TravelModule([Text("这里展示信息来源、说明或数据口径。所有数值均为本地验收示例。", "sm", "muted")], "evidence")
media = TravelModule([Grid([TravelItem("示例图一", null, null, null, null, false, "asset:fliggy-poi"), TravelItem("示例图二", null, null, null, null, false, "asset:fliggy-poi")], 2, 160, 2)], "media", "图片与内容组合")
followup = TravelModule([Button("换成适合亲子游的方案", @Set($result, "已选择亲子方向"), "ghost"), Button("看看下雨时的室内备选", @Set($result, "已选择室内备选"), "ghost")], "followup")
$result = "点击追问检查交互"`,
  },
];
