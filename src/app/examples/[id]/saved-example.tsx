'use client';
import {Renderer,type ActionEvent,type OpenUIError} from '@openuidev/react-lang';
import {useCallback,useEffect,useState} from 'react';
import {library} from '@/lib/library';
import {runLibraryAction} from '@/lib/actions';
export function SavedExample({title,program}:{title:string;program:string}){
 const [notice,setNotice]=useState('');
 useEffect(()=>{document.documentElement.setAttribute('data-openui-theme','light');document.documentElement.style.colorScheme='light'},[]);
 const onAction=useCallback((event:ActionEvent)=>{
  if(event.type==='continue_conversation'){setNotice('这是固定示例，模型追问请使用自定义需求。');return}
  void runLibraryAction(event);
 },[]);
 const onError=useCallback((errors:OpenUIError[])=>{if(errors.length)setNotice('部分内容无法显示：'+errors.map(e=>e.message).join('；'))},[]);
 return <main style={{minHeight:'100dvh',padding:'24px 18px',background:'#F5F5FF',color:'#0F131A',fontFamily:'var(--iui-font)'}}>
  <header style={{fontSize:17,fontWeight:500,marginBottom:18}}>{title}</header>
  <Renderer response={program} library={library} isStreaming={false} onAction={onAction} onError={onError}/>
  {notice&&<p role="status">{notice}</p>}
 </main>;
}
