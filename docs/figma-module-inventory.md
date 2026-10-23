# Figma 41042:11715 组件覆盖清单

已有规范优先：颜色、字号、圆角 3/6/12、间距 6–48、按钮、标签、回答文字和用户气泡不覆盖。下表是接入映射，不代表整张 Figma 的所有功能已逐像素迁移。

| 节点 | 类型 | 接入方式 |
| --- | --- | --- |
| 26220–26222 | 思考/数据佐证/信息提示 | TravelModule evidence + Text / Caption |
| 26223–26227 | 标题/正文/列表 | 已补充，保留 |
| 26228–26230 | 单图/双图/三图 | TravelModule media + Image / SearchImage / Grid |
| 26231 | 时间分隔 | Caption + Divider，保留字号与间距 |
| 26232–26233 | 左目录/上目录表格 | TravelModule table-left / table + Table |
| 26234–26235 | 酒店/商品/POI 推荐卡 | TravelModule product + TravelItem + Price + Badge + Button |
| 26236 | 航班卡 | TravelModule flight + Grid / Text / Price / Button |
| 26237 | 手绘地图 | Image 动态资产；交互地图继续使用 MapView |
| 26238 | 右侧文字动作 | Row + Link / Button ghost |
| 26239 | 预算调整 | TravelModule budget + Slider + Button |
| 26240 | 信息/表单卡 | TravelModule form + FieldRow + Input / Select |
| 26241 | 订单卡 | TravelModule order + FieldRow / Grid / Price / Button |
| 26242 | POI 概览 | TravelModule poi + TravelItem |
| 26243 | 状态卡 | TravelModule status + Text + action slot |
| 26244 | 行程概览 | TravelModule itinerary + TravelItem + DayBadge |
| 26245 | 提醒 | TravelModule notice + Text |
| 26246–26247 | 多选/单选澄清 | TravelModule choices + Checkbox / RadioGroup + Button |
| 26248–26249 | 回答底部/追问 | TravelModule followup + Button / IconButton，复用现有动作 |

表中 262xx 节点前缀均为 40995。新模块复用项目已有组件与动作；不把示例价格、日期、酒店和图片写死在组件中。原 Card 及已存回复协议继续兼容。

## 本批边界

- 已落地：旅行卡片容器、图文条目、DAY 日期块、价格、表单字段行；预算、订单、航班、POI、行程、状态、提醒、单/多选、两类表格与追问的组合样式和验收示例。
- 信息来源、图片组合、时间分隔、地图继续通过已有基础组件组合；这部分是映射复用，没有实现专用的思考动画或单/双/三图裁切规则。
- Figma 表格的复制/全屏工具、回答反馈工具条，以及页面外壳的导航、语音/相机输入不在本批卡片验收中。未添加没有实际功能的控件。
- 新模块已注册到 Web/QoderWork，并写入生成提示词。保存的旧回答不会自动改写为新组件；需新生成对应旅行内容来验收模型使用效果。
- 组件优先沿用已批准的圆角 12px、卡片 padding 24px（窄屏 18px），没有照搬全集的 18px 圆角/12px padding。字号沿用此前档位，价格数字取 18px；缺少 Alibaba 字体时使用已批准字体栈。
- 设计稿引用的 `@ali/fliggy-design` 包未在本项目安装，因此使用现有 OpenUI 控件与本地模块；图标和验收示例图片从 Figma 下载并内嵌，不依赖临时资产 URL。
