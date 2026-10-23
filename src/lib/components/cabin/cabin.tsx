"use client";
import { defineComponent, reactive, useStateField, useIsStreaming } from '@openuidev/react-lang';
import { useEffect,useId,useRef,useState } from 'react';
import { z } from 'zod/v4';
import { CabinKit } from './vendor/cabin-kit';
import { cabinPresets, seatPlans,seatsOf,toggleSeat,type Config,type Block,type Seat,type Preference } from './model';
import airlineCatalog from './airline-catalog.json';
import './vendor/cabin-kit.css';
import './cabin.css';
const seat=z.union([z.string().min(1).max(3),z.object({letter:z.string(),id:z.string().optional(),position:z.enum(['window','aisle','middle']).optional(),noWindow:z.boolean().optional(),disabled:z.boolean().optional()})]).nullable();
export const CabinRow=defineComponent({name:'CabinRow',props:z.object({number:z.number().int(),groups:z.array(z.array(seat).min(1).max(10)).min(1).max(4),cabin:z.enum(['economy','business','premium']).optional(),exit:z.boolean().optional(),wing:z.boolean().optional(),pitch:z.number().min(0).max(48).optional()}),description:'Seat-row data inside CabinView custom blocks. groups are seat groups separated by aisles, e.g. [["A","B","C"],["D","E","F"]]. null preserves missing seat geometry. Never invent actual aircraft exit/window facts.',component:()=>null});
export const CabinSection=defineComponent({name:'CabinSection',props:z.object({title:z.string(),subtitle:z.string().optional()}),description:'Cabin section heading in CabinView blocks.',component:()=>null});
export const CabinExit=defineComponent({name:'CabinExit',props:z.object({label:z.string(),left:z.boolean().optional(),right:z.boolean().optional()}),description:'Exit marker in CabinView blocks; only position from supplied layout. Seat-row exit=true must also mark the affected row.',component:()=>null});
export const CabinServices=defineComponent({name:'CabinServices',props:z.object({items:z.array(z.object({kind:z.enum(['lavatory','galley']),accessible:z.boolean().optional(),label:z.string().optional(),span:z.number().int().min(1).max(4).optional()}).nullable()).min(1).max(8),columns:z.number().int().min(1).max(4).optional()}),description:'Toilets/galley service row in CabinView blocks. null is an empty cell.',component:()=>null});
export const CabinNote=defineComponent({name:'CabinNote',props:z.object({text:z.string()}),description:'Layout annotation inside CabinView.',component:()=>null});
export const CabinDivider=defineComponent({name:'CabinDivider',props:z.object({label:z.string().optional()}),description:'Cabin section separator inside CabinView.',component:()=>null});
export const CabinSpacer=defineComponent({name:'CabinSpacer',props:z.object({height:z.number().min(0).max(48)}),description:'Cabin layout spacing in CSS px; use 6/12/18/24/30/36/42/48.',component:()=>null});
const blockRefs=z.array(z.union([CabinRow.ref,CabinSection.ref,CabinExit.ref,CabinServices.ref,CabinNote.ref,CabinDivider.ref,CabinSpacer.ref])).max(120);
const blockTypes:Record<string,string>={CabinRow:'row',CabinSection:'section',CabinExit:'exit',CabinServices:'services',CabinNote:'note',CabinDivider:'divider',CabinSpacer:'spacer'};
const kit=CabinKit as unknown as {validate:(c:Config)=>{seats:number;ids:string[]};mount:(el:HTMLElement,c:Config,options:{onSeatSelect:(seat:Seat,button:HTMLButtonElement)=>void})=>HTMLElement};
export const CabinView=defineComponent({
 name:'CabinView',
 props:z.object({title:z.string(),preset:z.enum(['cathay32p','a320','regional','widebody','airchinaA320158','csairA32032h','hainanA320neo172','custom']),blocks:blockRefs.optional(),selected:reactive(z.array(z.string()).optional()),passengers:z.number().int().min(1).max(6).optional(),preference:z.enum(['any','window','aisle','together']).optional(),avoidExit:z.boolean().optional(),blocked:z.array(z.string()).optional(),cabin:z.enum(['economy','premium','business','all']).optional(),suggestions:z.array(z.object({seats:z.array(z.string()).min(1).max(6),reason:z.string()})).max(3).optional()}),
 description:'Compact interactive cabin/check-in planning module, no extra Card. Built-in linked recommendations and local seat selection. passengers must match user count. cabin defaults to economy. preference defaults to together for multiple people. suggestions=[{seats:["31A","31B"],reason:"同排靠窗"}] links exact recommended IDs and explanations to highlights and locate/select buttons; invalid/unavailable/non-adjacent groups are discarded. Prefer the built-in recommendation text as the single source of truth; do not repeat static specific seat recommendations outside the module. Selected summary must bind the same $seats. Missing aircraft/version must be clarified before using a preset. presets: airchinaA320158=国航 A320 158 seats; csairA32032h=南航 A320 32H 166 seats; hainanA320neo172=海航 A320neo layout 1 172 seats (business row unknown, labels only); cathay32p=provided CX A321neo 32P 195 seats; a320=generic A320 180 schematic; regional=2-2 example; widebody=3-3-3 example. custom requires ordered CabinRow/Section/Exit/Services/Note/Divider/Spacer blocks from supplied geometry; do not guess real aircraft layouts. selected may bind $seats for external summary. passengers controls max selected. avoidExit=true for child travelers or users requesting non-exit seats, not an eligibility determination. blocked only from supplied data. No live inventory, payment, reservation or check-in success. Ask for airline+aircraft/configuration when unknown; label examples explicitly.',
 component:({props,statementId})=>{
  const fallback=useId();const selection=useStateField(statementId??fallback,props.selected??[]);const streaming=useIsStreaming();
  const defaultPref=props.preference??((props.passengers??1)>1?'together':'any');
  const [pref,setPref]=useState<Preference>(defaultPref);const [status,setStatus]=useState('');const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{setPref(defaultPref);},[defaultPref]);
  const [cabin,setCabin]=useState<string>(props.cabin??'economy');
  useEffect(()=>{setCabin(props.cabin??'economy');},[props.cabin]);
  const airline=airlineCatalog.find(x=>x.preset===props.preset);
  const count=props.passengers??1;const blocked=new Set(props.blocked??[]);const avoidExit=props.avoidExit??false;
  const blocks=(props.blocks??[]).map(node=>{const n=node as unknown as {typeName:string;props:Record<string,unknown>};return {type:blockTypes[n.typeName]??'invalid',...n.props} as Block});
  const config:Config=props.preset==='custom'?{name:props.title,width:480,blocks}:cabinPresets[props.preset];
  let error='';let seats:Seat[]=[];
  try {if(!config)throw Error('请选择机舱配置');const stats=kit.validate(config);if(!stats.seats||stats.seats>600)throw Error('机舱需包含1–600个座位');seats=seatsOf(config);}catch(e){error=e instanceof Error?e.message:'机舱配置不完整';}
  const current=(Array.isArray(selection.value)?selection.value:[]).filter((id):id is string=>typeof id==='string'&&seats.some(s=>s.id===id&&!s.disabled&&!blocked.has(id)&&(!avoidExit||!s.exit))).slice(0,count);
  const plans=!error?seatPlans(config,pref,count,blocked,avoidExit,cabin,props.suggestions??[]):[];
  const recommended=new Set(plans.flatMap(p=>p.seats));
  const locate=(id:string)=>{const button=Array.from(host.current?.querySelectorAll<HTMLButtonElement>('.ck-seat')??[]).find(b=>b.dataset.seat===id);const viewport=host.current?.parentElement;if(button&&viewport)viewport.scrollTop+=button.getBoundingClientRect().top-viewport.getBoundingClientRect().top-48;};
  const planKey=JSON.stringify(plans.map(p=>p.seats));
  const handler=useRef<(seat:Seat)=>void>(()=>{});
  handler.current=seat=>{if(streaming||seat.disabled||blocked.has(seat.id)||(avoidExit&&seat.exit))return;const next=toggleSeat(current,seat.id,count);if(next===current){setStatus(`最多预选 ${count} 个座位，请先取消一个。`);return;}selection.setValue(next);setStatus(next.includes(seat.id)?`已预选 ${seat.id}，尚未值机`:`已取消 ${seat.id}`);};
  const signature=JSON.stringify(config);
  useEffect(()=>{
   if(!host.current||error||streaming)return;
   try{kit.mount(host.current,config,{onSeatSelect:seat=>handler.current(seat)});}catch{setStatus('机舱配置无法显示，请重新生成。');}
  // Only geometry changes rebuild DOM; selection changes preserve scroll and focus.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[signature,error,streaming]);
  useEffect(()=>{
   host.current?.querySelectorAll<HTMLButtonElement>('.ck-seat').forEach(button=>{
    const id=button.dataset.seat!;const s=seats.find(x=>x.id===id);if(!s)return;
    button.disabled=streaming||!!s.disabled||blocked.has(id)||(avoidExit&&s.exit);
    button.setAttribute('aria-pressed',String(current.includes(id)));
    button.classList.toggle('ck-match',recommended.has(id));
   });
  });
  useEffect(()=>{if(!streaming&&plans[0])locate(plans[0].seats[0]);},[planKey,streaming,signature]);
  const details=current.map(id=>seats.find(s=>s.id===id)!).filter(Boolean);
  return <section className="iui-card iui-cabin-module" aria-label={props.title}>
   <h3 className="iui-travel-heading">{props.title}</h3>
   <p className="iui-cabin-source">{airline?`${airline.name} ${airline.model} · 图库配置参考`:'示意配置 · 非特定航班座位图'} · {seats.length} 座 · 非实时余位</p>
   <div className="iui-cabin-preferences" aria-label="选座偏好">{([['any','全部'],['window','靠窗'],['aisle','靠过道'],['together','同行连座']] as const).map(([v,label])=><button type="button" key={v} aria-pressed={pref===v} onClick={()=>setPref(v)}>{label}</button>)}</div>
   <label className="iui-cabin-class">舱等 <select aria-label="推荐舱等" value={cabin} onChange={e=>setCabin(e.target.value)}><option value="economy">经济舱</option><option value="premium">明珠/优选经济舱</option><option value="business">商务/公务舱</option><option value="all">全部舱等</option></select></label>
   <div className="iui-cabin-plans" aria-label="联动座位推荐">{plans.map((plan,i)=><button type="button" key={plan.seats.join()} disabled={streaming} onClick={()=>{selection.setValue(plan.seats);locate(plan.seats[0]);setStatus(`已预选推荐组合 ${plan.seats.join("、")}，尚未值机`);}}><strong>方案{i+1} · {plan.seats.join(" + ")}</strong><span>{plan.reason}</span><span>定位并预选</span></button>)}</div>
   <div className="iui-cabin-legend"><span>浅紫：匹配偏好</span><span>深紫：已预选</span><span>灰色禁用：不可选</span></div>
   {avoidExit&&<p className="iui-cabin-hint">已排除出口排；实际乘坐资格由航司确认。</p>}
   {error?<p role="status">{streaming?'正在整理机舱…':`配置待补全：${error}`}</p>:<div className="iui-cabin-viewport" tabIndex={0} aria-label="机舱座位图，可滚动"><div ref={host}/></div>}
   {!error&&!plans.length&&<p className="iui-cabin-hint">当前配置没有符合该偏好的座位组合，请调整条件。</p>}
   <div className="iui-cabin-selection" aria-live="polite"><strong>本地预选 {current.length} / {count}</strong><p>{details.length?details.map(s=>`${s.id} · ${s.noWindow?'无窗':s.position==='window'?'靠窗':s.position==='aisle'?'靠过道':'中间'}${s.exit?' · 出口排':''}`).join('；'):'点击座位查看位置并预选'}</p></div>
   <p role="status" className="iui-cabin-hint">{status||'仅辅助选座，未向航空公司提交值机。'}</p>
  </section>;
 }
});
export const cabinComponents=[CabinView,CabinRow,CabinSection,CabinExit,CabinServices,CabinNote,CabinDivider,CabinSpacer];
