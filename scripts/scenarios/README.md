# 固定场景示例

`inputs.json` 包含通用 10 条、OTA 15 条及组件举例 3 条原始需求；保存结果在 `public/scenario-examples/`。
网页点击直接使用 `/examples/{scene}-{id}` 加载保存的程序，通过飞猪项目的真实组件库渲染；不调用模型。

维护时可运行 `node scripts/scenarios/generate.mjs` 预生成缺失内容（会调用模型，已完成内容会跳过）。
运行 `node scripts/scenarios/verify.mjs` 检查全部内容、场景一致性、程序结构及页面 HTTP 状态。

每份记录保留原始需求、标题、生成时间与程序。需要更换某个示例时，先保留旧版本，再显式重新生成；不要在页面访问时触发生成。
