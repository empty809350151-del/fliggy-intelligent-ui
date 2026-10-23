import type {OutputEvidence} from './embed-evidence';
import {validSend, type SendRequest} from './embed-protocol';
export type EmbedReply={type:'fliggy:accepted'|'fliggy:completed'|'fliggy:error';requestId:string;message?:string;output?:string;evidence?:OutputEvidence};
export function createEmbedController(runtime:{busy:()=>boolean;newChat:()=>void;send:(text:string)=>Promise<void|string|{output:string;evidence:OutputEvidence}>}){
 const records=new Map<string,EmbedReply>();let active=false;
 return {
  busy:()=>active||runtime.busy(),
  async receive(request:SendRequest,reply:(event:EmbedReply)=>void){
   if(!validSend(request))return;
   const previous=records.get(request.requestId);if(previous){reply(previous);return}
   const emit=(event:EmbedReply)=>{records.set(request.requestId,event);reply(event)};
   if(records.size>=1000){reply({type:'fliggy:error',requestId:request.requestId,message:'当前页面请求过多，请重新加载后重试。'});return}
   if(active||runtime.busy()){emit({type:'fliggy:error',requestId:request.requestId,message:'聊天正在加载或生成，请稍后重试。'});return}
   active=true;emit({type:'fliggy:accepted',requestId:request.requestId});
   try{if(request.newChat)runtime.newChat();const output=await runtime.send(request.text.trim());emit({type:'fliggy:completed',requestId:request.requestId,...(typeof output==='string'?{output}:output||{})})}
   catch{emit({type:'fliggy:error',requestId:request.requestId,message:'生成失败或已中断，请查看聊天中的错误提示后重试。'})}
   finally{active=false}
  }
 };
}
