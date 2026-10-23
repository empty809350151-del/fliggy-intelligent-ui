from pathlib import Path
import json
rows=[
('sanya-day','三亚一日游','从三亚瑞吉度假酒店出发，晚上再回到酒店，一天行程怎么安排？晚上还想逛夜市和酒吧','酒店出发 · 日游 · 夜市 · 酒吧 · 返回','三亚日游与夜间路线',[('places','medium'),('steps','organize'),('choices','state')],{'organize':['text','list'],'medium':['map'],'state':['select','day-badge']}),
('west-checklist','川西行前清单','明天出发去川西大环线，需要准备什么？给我个核对清单','准备 · 核对 · 明天','川西大环线出发核对清单',[('steps','organize'),('choices','state'),('relative','format')],{'organize':['text','travel-module'],'state':['check','feedback','select'],'format':['text']}),
('family-pet','亲子宠物入住','带孩子和狗出行，填写信息（孩子年龄，狗的品种可选择和体重和犬证疫苗证支持上传），哪些酒店让带狗，儿童早餐是否免费','年龄 · 犬种 · 体重 · 证件 · 入住政策',[ '亲子宠物酒店匹配表单'][0],[('choices','state'),('comparison','medium'),('knowledge','organize')],{'organize':['text','card'],'state':['input','select','button','canvas'],'medium':['table']}),
('team-split','团建费用均摊','我们团建出行帮我根据吃住行计划计算人均均摊','吃 · 住 · 行 · 人数 · 均摊','团建吃住行均摊计算器',[('numbers','compute'),('choices','state'),('numbers','format')],{'compute':['input','table','price'],'state':['input','button'],'format':['text','price']}),
('reschedule','机酒整体改期','我有事没办法周六出发了，帮我把之前预订好的机票和酒店平移到之后的时间','原订单 · 延后 · 日期平移 · 费用','机票酒店整体改期方案',[('previous','state'),('relative','format'),('comparison','medium'),('assistant','boundary')],{'state':['date','input','button'],'format':['text','date'],'medium':['table'],'boundary':['text','feedback']})]
items=[]
for id,name,prompt,split,title,paths,mapping in rows:items.append(dict(id=id,name=name,prompt=prompt,split=split,title=title,paths=paths,mapping=mapping))
Path('../output/merged-framework-source/ota-extra.json').write_text(json.dumps(items,ensure_ascii=False,indent=2))
p=Path('scripts/scenarios/inputs.json');data=json.loads(p.read_text())
for x in items:
 if not any(i['key']=='ota-'+x['id'] for i in data):data.append(dict(key='ota-'+x['id'],scene='ota',title=x['title'],prompt=x['prompt']))
p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
# Reuse the already generated exact checklist prompt.
x=items[1];saved=json.loads(Path('public/scenario-examples/component-checklist.json').read_text());saved.update(key='ota-west-checklist',scene='ota');Path('public/scenario-examples/ota-west-checklist.json').write_text(json.dumps(saved,ensure_ascii=False,indent=2))
p=Path('src/app/examples/[id]/page.tsx');s=p.read_text().replace('component-(map|checklist)', 'component-(map|checklist)|ota-(sanya-day|west-checklist|family-pet|team-split|reschedule)');p.write_text(s)
p=Path('scripts/scenarios/generate.mjs');s=p.read_text().replace("item.prompt+'\\n请生成", "item.prompt+(item.key==='ota-family-pet'?'\\n必须支持真实本地文件选择，可用 HtmlView 内 input type=file 接收犬证和疫苗证，显示文件名；文件仅本地，不上传服务器。表单包含孩子年龄、可选择犬种、体重，提交后匹配明确标注的示例酒店政策。':item.key==='ota-reschedule'?'\\n未提供订单，使用可编辑的示例机票酒店日期；选择新出发日期后按日期差整体平移，显示原日期和新日期对照及待确认费用，不执行真实改签。':item.key==='ota-sanya-day'?'\\n行程从三亚瑞吉度假酒店出发并返回，包含夜市和酒吧，提供地图路线。时间与地点信息标注为行程示例，未查询实时营业状态。':'')+'\\n请生成")
p.write_text(s)
