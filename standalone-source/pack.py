from pathlib import Path
import json,re
root=Path.cwd();src=Path('standalone-source')
def js(v):return json.dumps(v,ensure_ascii=False).replace('<','\\u003c')
examples={p.stem:json.loads(p.read_text()) for p in Path('public/scenario-examples').glob('*.json')}
config={}
for line in Path('.env.local').read_text().splitlines():
 if '=' in line:
  k,v=line.split('=',1)
  if k in ['LLM_BASE_URL','LLM_MODEL','LLM_API_KEY']:config[k]=v.strip().strip('\"\x27')
viewerjs=(src/'build/viewer.js').read_text();css=(src/'build/viewer.css').read_text()
graph=Path('../output/intelligent-ui-merged.html').read_text()
# Custom output loads the deployed project; fixed examples remain embedded.
PUBLIC_FLIGGY_URL='https://fliggy.47-253-226-200.sslip.io/'
graph=re.sub(r'(const FLIGGY_EMBED=\{\"url\":\s*)\"[^\"]+\"',lambda m:m.group(1)+json.dumps(PUBLIC_FLIGGY_URL),graph,count=1)
graph=graph.replace('聊天项目未就绪，请检查项目地址或重新加载。','公网聊天未完成联动握手，请检查网络及公网项目对本地 HTML 的嵌入支持。')
override='''<script>
window.openHostScenarioPreview=payload=>{window.parent.openSavedExample(payload.example,payload.title,payload.prompt,window.parent.document.getElementById('sankey-frame'));return true};
</script>'''
graph=graph.replace('</body>',override+'</body>')
# Embedded view is explicit, rather than inferred from an external URL.
graph=graph.replace('<html','<html class="sankey-embed"',1)
graph=graph.replace("if(next==='custom'&&location.protocol==='file:'){location.href='http://127.0.0.1:8767/?scene=custom';return}",'')
# References to research sub-pages open bundled copies through the parent.
related={p.name:p.read_text() for p in Path('../output').glob('*.html') if p.name!='intelligent-ui-merged.html'}
main=Path('/Users/tianzhongyi/Desktop/生成式UI-独立版.html').read_text()
main=main.replace("caseFrame.src = new URL('/examples/' + example, COMPONENT_EXAMPLES_ORIGIN).href;","caseFrame.srcdoc = makeStandaloneViewer(example);")
main=main.replace("caseFrame.removeAttribute('src');","caseFrame.removeAttribute('srcdoc');")
start=main.index('  let sankeyLayoutPort;');end=main.index('  (() => {',start)
main=main[:start]+'''  function loadStandaloneGraph(){sankeyFrame.srcdoc=STANDALONE_GRAPH;}
  sankeyFrame.addEventListener('load',()=>{
    const doc=sankeyFrame.contentDocument;
    if(!doc?.querySelector('main'))return;
    const resize=()=>{sankeyFrame.style.height=Math.max(1800,Math.ceil(doc.querySelector('main').getBoundingClientRect().bottom)+120)+'px'};
    new ResizeObserver(resize).observe(doc.querySelector('main'));resize();
  });
  loadStandaloneGraph();
  document.getElementById('sankey-open').removeAttribute('href');
  document.getElementById('sankey-open').onclick=()=>{const win=window.open('about:blank');if(win){win.document.open();win.document.write(STANDALONE_GRAPH.replace('window.parent.makeStandaloneViewer','window.opener.makeStandaloneViewer').replaceAll('window.parent.openSavedExample','window.opener.openSavedExample').replaceAll("window.parent.document.getElementById('sankey-frame')","window.opener.document.getElementById('sankey-frame')"));win.document.close();win.makeStandaloneViewer=makeStandaloneViewer;}};
  document.getElementById('sankey-reload').onclick=loadStandaloneGraph;
'''+main[end:]
main=re.sub(r'<p class="sankey-service-note"[^>]*>.*?</p>','<p class="sankey-service-note">单文件内置桑基图与固定交互案例，无需安装或启动服务。自定义需求连接飞猪帮帮公网项目；实时生成、地图底图与在线图片需要联网。</p>',main,flags=re.S)
bootstrap='''<script>
const STANDALONE_GRAPH='''+js(graph)+''';
const STANDALONE_EXAMPLES='''+js(examples)+''';
const VIEWER_JS='''+js(viewerjs)+''',VIEWER_CSS='''+js(css)+''';
const MODEL_CONFIG='''+js({'baseURL':config['LLM_BASE_URL'],'model':config['LLM_MODEL'],'apiKey':config['LLM_API_KEY']})+''';
function makeStandaloneViewer(key){
 const example=key?STANDALONE_EXAMPLES[key]:null;
 const cfg=example?{program:example.program,title:example.title}:MODEL_CONFIG;
 const safe=JSON.stringify(cfg).replace(/</g,String.fromCharCode(92)+'u003c');
 return '<!doctype html><html data-openui-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+VIEWER_CSS+'</style></head><body><div id="app"></div><script>window.DEMO_CONFIG='+safe+';<\\/script><script>'+VIEWER_JS.replace(/<\\/script/gi,'<\\\\/script')+'<\\/script></body></html>';
}
</script>'''
# Bootstrap must exist before the original page script runs.
main=main.replace('</head>',bootstrap+'</head>',1)
notice='''<section style="max-width:1160px;margin:36px auto;padding:24px;border-top:1px solid #ddd;font:14px/1.8 system-ui;color:#666"><strong>单文件使用说明</strong><p>直接打开本 HTML 即可阅读并操作桑基图、28 个固定案例和自定义需求，无需下载运行包或安装环境。模型生成、地图底图和在线图片需要联网；网络或第三方服务不可用时会提示失败。建议使用最新版 Chrome 或 Edge。</p><p>按作者授权，本文件包含其 DeepSeek 密钥。接收者可以读取并使用该密钥，调用费用计入该账户，请勿公开分发。</p></section>'''
before,closing,after=main.rpartition('</body>')
main=before+notice+closing+after
out=Path('/Users/tianzhongyi/Desktop/生成式UI-直接打开版.html');out.write_text(main)
print('Generated:',out,'MB:',round(out.stat().st_size/1024**2,1))
