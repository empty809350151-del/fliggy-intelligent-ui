'use client';
import {useThread, useThreadList} from '@openuidev/react-ui';
import {useEffect, useLayoutEffect, useRef} from 'react';
import {EMBED_PARENT_ORIGINS} from './embed-config';
import {trustedParent, validSend} from './embed-protocol';
import {inspectOutput} from './embed-evidence';
import {library} from './library';
import {createEmbedController} from './embed-controller';

export function FliggyEmbedBridge(){
 const thread=useThread(s=>s),list=useThreadList(s=>s);
 const live=useRef({thread,list});
 useLayoutEffect(()=>{live.current={thread,list}},[thread,list]);
 const controller=useRef<ReturnType<typeof createEmbedController>|null>(null);
 if(!controller.current)controller.current=createEmbedController({
  busy:()=>live.current.thread.isRunning||live.current.thread.isLoadingMessages||live.current.list.isLoadingThreads,
  newChat:()=>live.current.list.switchToNewThread(),
  send:async(text)=>{
   let cancelled=false;
   const onCancel=()=>{cancelled=true};window.addEventListener('fliggy:generation-aborted',onCancel);
   try{
    await live.current.thread.processMessage({role:'user',content:text});
    // processMessage catches backend failures internally; allow React to commit
    // the store's final error/messages before reporting completion to the parent.
    await new Promise<void>(resolve=>setTimeout(resolve,50));
    const state=live.current.thread,last=state.messages[state.messages.length-1];
    if(cancelled||state.threadError||!last||last.role!=='assistant')throw Error('Generation failed or cancelled');
    const output=typeof last.content==='string'?last.content:JSON.stringify(last.content);
    return {output:output.slice(0,100000),evidence:inspectOutput(output,library)};
   }finally{window.removeEventListener('fliggy:generation-aborted',onCancel)}
  }
 });
 useEffect(()=>{
  if(window.parent===window)return;
  const receive=(event:MessageEvent)=>{
   if(!trustedParent(event.origin,event.source,window.parent,[...EMBED_PARENT_ORIGINS,window.location.origin]))return;
   if(event.data?.type==='fliggy:hello'){
    if(!live.current.thread.isLoadingMessages&&!live.current.list.isLoadingThreads)window.parent.postMessage({type:'fliggy:ready',version:1,busy:controller.current!.busy()},event.origin);
   }else if(validSend(event.data))void controller.current!.receive(event.data,value=>window.parent.postMessage(value,event.origin));
  };
  window.addEventListener('message',receive);
  return()=>window.removeEventListener('message',receive);
 },[]);
 return null;
}
