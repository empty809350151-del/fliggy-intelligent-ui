import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@modelcontextprotocol/ext-apps';
import { Renderer, type ActionEvent } from '@openuidev/react-lang';
import { BuiltinActionType } from '@openuidev/lang-core';
import { library } from './library';
import { runLibraryAction } from '../../src/lib/actions';
import { webUrl } from '../../src/lib/components/style';
import 'katex/dist/katex.min.css';

const bridge = new App({name:'Intelligent UI',version:'1.0.0'}, {}, {autoResize:true});
function View() {
 const [data,setData] = useState({program:'',title:'Intelligent UI'});
 const [error,setError] = useState('');
 React.useEffect(()=>{
  bridge.ontoolresult = result => {
   let content = result.structuredContent as {program?:string;title?:string}|undefined;
   if (!content?.program) for (const item of result.content || []) { if (item.type === 'text') { try { const parsed = JSON.parse(item.text); if (parsed.program) content = parsed; } catch {} } }
   if(content?.program) { setData({program:content.program,title:content.title || 'Intelligent UI'}); setError(''); }
   else if(result.isError) setError('生成的界面有语法错误，请让助手修正后重试。');
  };
  bridge.onhostcontextchanged = ctx => { if(ctx.theme) document.documentElement.dataset.theme = ctx.theme; };
  bridge.connect().then(()=>{document.documentElement.dataset.theme = bridge.getHostContext()?.theme || 'light';}).catch(e=>setError(String(e)));
 },[]);
 async function onAction(event:ActionEvent) {
  try {
   if(event.type === BuiltinActionType.ContinueConversation) {
    const r = await bridge.sendMessage({role:'user',content:[{type:'text',text:event.humanFriendlyMessage+'\n当前表单：'+JSON.stringify(event.formState || {})}]});
    if(r.isError) throw new Error('QoderWork 未接受后续消息。');
   } else if(event.type === BuiltinActionType.OpenUrl) {
    const url = webUrl(String(event.params.url || ''));
    if(url) await bridge.openLink({url});
   } else if(await runLibraryAction(event) === false) throw new Error('复制未成功，请检查宿主剪贴板权限。');
  } catch(e) { setError(String(e)); }
 }
 return <main style={{fontFamily:'var(--iui-font)',color:'var(--iui-ink)',background:'var(--iui-canvas)',padding:20,minHeight:160}}>
  {error && <p role="alert">{error}</p>}
  {data.program ? <Renderer key={data.program} response={data.program} library={library} isStreaming={false} onAction={onAction} onError={errors=>{if(errors.length)setError(errors.map(e=>e.message).join('\n'));}}/> : <p>正在准备交互界面…</p>}
 </main>;
}
createRoot(document.getElementById('root')!).render(<View/>);
