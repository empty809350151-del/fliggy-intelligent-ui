import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Renderer} from '@openuidev/react-lang';
import {generateSystemPrompt} from '@openuidev/lang-core';
import {library} from './lib/library';
import {inspectOutput} from './lib/embed-evidence';
import {runLibraryAction} from './lib/actions';
import spec from './generated/spec.json';
import {promptOptions} from './lib/prompt-options';
import '../src/app/globals.css';
const W=window as any,C=W.DEMO_CONFIG;
const originalFetch=window.fetch.bind(window);
window.fetch=async(input:any,init?:any)=>{
 const value=typeof input==='string'?input:input?.url;
 if(value?.startsWith('/api/')){
  const u=new URL(value,'https://standalone.invalid');let result:any={};
  if(u.pathname==='/api/street-route'){
   const r=await originalFetch('https://router.project-osrm.org/route/v1/driving/'+u.searchParams.get('coords')+'?overview=full&geometries=geojson',init);const d=await r.json();result={points:(d.routes?.[0]?.geometry?.coordinates||[]).map((p:any)=>[p[1],p[0]])};
  }else{
   const q=u.searchParams.get('title')||u.searchParams.get('q')||'';
   const url='https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({action:'query',format:'json',origin:'*',generator:'search',gsrsearch:q,gsrnamespace:'6',gsrlimit:'4',prop:'imageinfo',iiprop:'url',iiurlwidth:'960'});
   const r=await originalFetch(url,init);const d=await r.json();const images=Object.values(d.query?.pages||{}).flatMap((p:any)=>p.imageinfo?.map((i:any)=>i.thumburl||i.url)||[]);result={photos:images,images};
  }
  return new Response(JSON.stringify(result),{headers:{'Content-Type':'application/json'}});
 }
 return originalFetch(input,init);
};
function App(){
 const [messages,setMessages]=useState<any[]>(C.program?[{role:'assistant',content:C.program}]:[]);
 const [text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [history,setHistory]=useState<any[]>(()=>{try{return JSON.parse(localStorage.getItem('standalone-fliggy-history')||'[]')}catch{return []}});
 const [showHistory,setShowHistory]=useState(false);
 let snapshot=messages;
 const notify=(phase:string,evidence?:any)=>{try{window.parent.standaloneChatStatus?.(phase,evidence)}catch{}};
 async function send(text:string,newChat=true){
  if(W.standaloneBusy)throw Error('正在生成，请稍候');if(!text.trim())throw Error('请输入需求');
  W.standaloneBusy=true;setBusy(true);setError('');notify('generating');
  const base=newChat?[]:snapshot,question={role:'user',content:text};setMessages([...base,question]);
  try{
   const system=generateSystemPrompt(spec as any,promptOptions)+'\n所有交互使用本地状态，不使用 Query 或 Mutation。日期以当前日期 '+new Date().toLocaleDateString('sv-SE')+' 为准。';
   let program='',evidence:any;
   for(let attempt=0;attempt<2;attempt++){
    const requestMessages=[{role:'system',content:system},...base.map(m=>({role:m.role,content:m.content})),question];
    if(attempt)requestMessages.push({role:'user',content:'修正上一份程序的组件参数错误，只输出完整合法程序：'+JSON.stringify(evidence.issues)+'\n'+program});
    const response=await originalFetch(C.baseURL.replace(/\/$/,'')+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+C.apiKey},body:JSON.stringify({model:C.model,messages:requestMessages,stream:false,reasoning_effort:'low'}),signal:AbortSignal.timeout(360000)});
    if(!response.ok)throw Error('模型请求失败（'+response.status+'），请检查网络或密钥额度。');
    const data=await response.json();program=data.choices?.[0]?.message?.content||'';evidence=inspectOutput(program,library);if(evidence.valid)break;
   }
   if(!evidence.valid)throw Error('生成内容未通过校验，请重试。');
   const next=[...base,question,{role:'assistant',content:program}];snapshot=next;setMessages(next);
   const saved=[{title:text.slice(0,30),messages:next},...history].slice(0,20);setHistory(saved);try{localStorage.setItem('standalone-fliggy-history',JSON.stringify(saved))}catch{}
   notify('complete',evidence);return evidence;
  }catch(e:any){setError(e.message||'生成失败');notify('error',{message:e.message});throw e}
  finally{W.standaloneBusy=false;setBusy(false)}
 }
 W.standaloneSend=send;
 return <main style={{padding:18,minHeight:'100vh',background:'#F5F5FF',color:'#0F131A',fontFamily:'system-ui'}}>
 {!C.program&&<header style={{display:'flex',justifyContent:'space-between',marginBottom:18}}><button disabled={busy} onClick={()=>setShowHistory(!showHistory)}>历史对话</button><strong>飞猪帮帮 · Intelligent UI</strong><button disabled={busy} onClick={()=>{setMessages([]);snapshot=[];setError('')}}>新聊天</button></header>}
 {showHistory&&<section>{history.map((h,i)=><button key={i} disabled={busy} style={{display:'block',padding:12}} onClick={()=>{setMessages(h.messages);setShowHistory(false)}}>{h.title}</button>)}</section>}
 {C.title&&<h2 style={{fontSize:17,marginBottom:18}}>{C.title}</h2>}
 {!messages.length&&<p style={{padding:'36px 0',fontSize:21}}>我是你的智能旅行助手，请输入需求。</p>}
 {messages.map((m,i)=>m.role==='user'?<p key={i} style={{background:'#e9e7ff',borderRadius:18,padding:15,margin:'18px 0',fontSize:17}}>{m.content}</p>:<Renderer key={i+':'+m.content.length} response={m.content} library={library} isStreaming={false} onAction={event=>{if(event.type==='continue_conversation'){if(C.program)setError('固定案例不调用模型，请在自定义需求中继续。');else void send(JSON.stringify(event.params),false).catch(()=>{});}else void runLibraryAction(event)}} onError={errors=>{if(errors.length)setError(errors[0].message)}}/>)}
 {busy&&<p role="status" style={{padding:18,color:'#6666ff'}}>正在生成 Intelligent UI…</p>}
 {error&&<p role="alert" style={{color:'#b42332',padding:12}}>{error}</p>}
 {!C.program&&<form style={{marginTop:24}} onSubmit={e=>{e.preventDefault();void send(text,false).then(()=>setText('')).catch(()=>{})}}><textarea aria-label="输入消息" disabled={busy} value={text} onChange={e=>setText(e.target.value)} style={{width:'100%',padding:12,border:'1px solid #ddd',borderRadius:12}}/><button disabled={busy||!text.trim()} type="submit" style={{padding:'10px 20px',background:'#6666ff',color:'white',borderRadius:8}}>发送</button></form>}
 </main>
}
createRoot(document.getElementById('app')!).render(<App/>);
