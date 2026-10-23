from pathlib import Path
import json
s=Path('standalone-source');d=json.loads(Path('public/scenario-examples/ota-reschedule.json').read_text())
cfg=json.dumps({'program':d['program'],'title':d['title']},ensure_ascii=False).replace('<','\\u003c')
js=(s/'build/viewer.js').read_text().replace('</script','<\\/script');css=(s/'build/viewer.css').read_text()
html='<!doctype html><html lang="zh-CN" data-openui-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>机票酒店整体改期方案 · 滑块版</title><style>'+css+'</style><style>body{margin:0;background:#f5f5ff}body>header,#app{max-width:760px;margin:auto}body>header{padding:24px 18px 0}body>header p{font:600 17px/1.6 system-ui}#app main{min-height:0!important}</style></head><body><header><small>用户任务</small><p>'+d['prompt']+'</p></header><div id="app"></div><script>window.DEMO_CONFIG='+cfg+';</script><script>'+js+'</script></body></html>'
Path('/Users/tianzhongyi/Desktop/机票酒店整体改期方案-滑块版.html').write_text(html)
print('Exported standalone reschedule case.')
