import fs from 'node:fs/promises';
import {createParser,parseMessage} from '@openuidev/lang-core';
const spec=JSON.parse(await fs.readFile('src/generated/spec.json','utf8'));
const parser=createParser(spec.schema,spec.root);
const inputs=JSON.parse(await fs.readFile('scripts/scenarios/inputs.json','utf8')).filter(item=>!process.env.SCENARIO_KEY||item.key===process.env.SCENARIO_KEY);
const errors=[];
async function one(item){
 const file=`public/scenario-examples/${item.key}.json`;
 try{const saved=JSON.parse(await fs.readFile(file,'utf8'));if(saved.prompt===item.prompt&&saved.validated){console.log('cached',item.key);return}}catch{}
 let correction='';
 for(let attempt=1;attempt<=3;attempt++){
  try{
   const response=await fetch('http://localhost:3100/api/chat',{method:'POST',headers:{'Content-Type':'application/json',Origin:'http://localhost:3100'},body:JSON.stringify({messages:[{role:'user',content:item.prompt+(item.key==='component-checklist'?'\n重新设计为可交互的川西大环线行前核对清单：按证件支付、衣物装备、健康准备、车辆出行分组，逐项勾选，实时显示完成数量和百分比，切换分组保留状态。明天日期根据当前日期计算；不编造实时天气、道路开放或用户健康状况，不给具体用药方案。提供查看未完成项和重置操作，内容简洁实用，使用已有组件。':item.key==='component-pet-hotel'?'\n提供宠物种类选择、体重数字输入、入住日期选择、目的地输入四个字段和筛选按钮。使用明确标注为虚构演示的住宿数据，包含目的地、可接待宠物种类、体重上限，按输入真实筛选并显示匹配项或无结果；入住日期保留在筛选汇总中，明确未查询该日实时房态。缺失或非法输入有反馈；不调用模型，不作真实预订。':item.key==='ota-family-pet'?'\n表单包含订单号、原航班、退改原因和期望的新日期，全部可编辑；点击整理信息后显示四项完整汇总，必填项缺失时明确反馈。使用 Input、Select 或 Textarea、DatePicker 与 Button 等已有组件，以本地状态完成填写和汇总，不提交实际退改申请。':item.key==='ota-reschedule'?'\n未提供订单，展示明确标注的示例机票酒店日期。日期调整必须使用 Slider 滑块，以延后天数为本地状态，范围 1 至 30 天、步长 1、默认 7 天；禁止使用 DatePicker 或日期输入框。滑动后立即按相同天数平移去程、返程、酒店入住和退房日期，保持行程天数及住宿晚数不变。明显展示当前延后天数、新出发日期及四项新旧日期对照。提供重置滑块按钮，重置为延后7天。原出发日期为当前日期之后的周六，使用日期函数计算。费用采用明确标注的虚构模拟规则，无需查询真实订单或价格。增加机票人数和酒店房间数输入（1至9），滑块延后天数同步驱动费用：每人机票改期手续费100元、每人机票差价为延后天数乘30元；每间酒店每晚差价为延后天数乘10元，住宿4晚。分别展示机票手续费、机票差价、酒店差价、额外费用合计，并显示公式或模拟规则，所有金额由同一状态计算。初始人数2、房间数1、延后7天时合计应为900元。明确这是演示用模拟费用，不是真实报价，不执行改签。日期间隔为4天、住宿4晚，避免称4天4晚行程。':item.key==='ota-sanya-day'?'\n行程从三亚瑞吉度假酒店出发并返回，包含夜市和酒吧，提供地图路线。时间与地点信息标注为行程示例，未查询实时营业状态。':'')+'\n请生成可独立展示的完整交互界面。采用本地状态完成交互，不使用 ToAssistant、Query 或 Mutation。需要示例数据时明确标注，不伪造预订成功。'+correction}]}),signal:AbortSignal.timeout(300000)});
   if(!response.ok)throw Error('HTTP '+response.status);
   const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',output='',complete=false;
   while(true){const chunk=await reader.read();if(chunk.done)break;buffer+=decoder.decode(chunk.value,{stream:true});let end;
    while((end=buffer.indexOf('\n\n'))>=0){const event=buffer.slice(0,end);buffer=buffer.slice(end+2);for(const line of event.split('\n'))if(line.startsWith('data: ')){const m=JSON.parse(line.slice(6));if(m.type==='response.output_text.delta')output+=m.delta;if(m.type==='response.completed')complete=true;if(m.type==='error')throw Error(m.message)}}
   }
   if(!complete||!output)throw Error('Incomplete generation');
   const parsed=parser.parse(parseMessage(output).content);
   if(!parsed.root||parsed.meta.incomplete||parsed.meta.errors.length||parsed.meta.unresolved.length)throw Error('Invalid program: '+JSON.stringify(parsed.meta));
   if(/\b(?:ToAssistant|Query|Mutation)\s*\(/.test(output))throw Error('Use only local interactions, not ToAssistant/Query/Mutation');
   await fs.writeFile(file,JSON.stringify({...item,program:output,validated:true,generatedAt:new Date().toISOString()},null,2)+'\n');console.log('saved',item.key);return;
  }catch(e){console.log('retry',item.key,attempt,String(e).slice(0,240));correction='\n上次生成失败，请严格遵循组件参数规范修正：'+String(e).slice(0,1800)}
 }
 errors.push(item.key);
}
let cursor=0;await Promise.all(Array.from({length:3},async()=>{while(cursor<inputs.length)await one(inputs[cursor++])}));
console.log('FINISHED',inputs.length-errors.length,'/',inputs.length,'failed',errors);if(errors.length)process.exitCode=1;
