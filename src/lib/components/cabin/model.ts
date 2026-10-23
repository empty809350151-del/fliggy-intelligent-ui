import presets from './presets.json';
export type Seat = {id:string;letter:string;row:number;cabin:string;position:string;wing:boolean;exit:boolean;noWindow?:boolean;recommended?:boolean;disabled?:boolean};
export type Block = {type:string;[key:string]:unknown};
export type Config = {name:string;width?:number;aisleWidth?:number;blocks:Block[]};
export type Preference = 'any'|'window'|'aisle'|'together';
export const cabinPresets=presets as unknown as Record<string,Config>;
/** Same geometric position rules as the supplied CabinKit. No aircraft facts inferred. */
export function seatsOf(config:Config):Seat[] {
 const out:Seat[]=[];
 for(const b of config.blocks){
  if(b.type!=='row'||b.header)continue;
  const groups=b.groups as (string|Partial<Seat>|null)[][];
  groups.forEach((group,gi)=>group.forEach((cell,i)=>{
   if(cell===null)return;
   const entry=typeof cell==='string'?{letter:cell}:cell;
   const position=(gi===0&&i===0)||(gi===groups.length-1&&i===group.length-1)?'window':(i===0&&gi>0)||(i===group.length-1&&gi<groups.length-1)?'aisle':'middle';
   out.push({id:String(b.number)+entry.letter,row:Number(b.number),letter:entry.letter!,cabin:String(b.cabin??'economy'),position,wing:!!b.wing,exit:!!b.exit,...entry});
  }));
 }
 return out;
}
export function recommendations(config:Config, preference:Preference, count:number, blocked:Set<string>, avoidExit:boolean):Set<string>{
 const seats=seatsOf(config);const available=(s:Seat)=>!s.disabled&&!blocked.has(s.id)&&(!avoidExit||!s.exit);
 if(preference==='window'||preference==='aisle')return new Set(seats.filter(s=>available(s)&&s.position===preference&&(preference!=='window'||!s.noWindow)).map(s=>s.id));
 if(preference!=='together')return new Set();
 const ids=new Set<string>();
 for(const b of config.blocks){
  if(b.type!=='row'||b.header)continue;
  for(const group of b.groups as (string|Partial<Seat>|null)[][]){
   for(let i=0;i<=group.length-count;i++){
    const run=group.slice(i,i+count).map(cell=>cell===null?undefined:seats.find(s=>s.id===(typeof cell==='object'&&cell.id?cell.id:String(b.number)+(typeof cell==='string'?cell:cell.letter))));
    if(run.every((s):s is Seat=>!!s&&available(s)))run.forEach(s=>ids.add(s!.id));
   }
  }
 }
 return ids;
}
export function toggleSeat(current:string[],id:string,limit:number):string[]{return current.includes(id)?current.filter(x=>x!==id):current.length<limit?[...current,id]:current;}

export function seatPlans(config:Config, preference:Preference, count:number, blocked:Set<string>, avoidExit:boolean, cabin:string, suggestions:{seats:string[];reason:string}[]=[]){
 const seats=seatsOf(config);const candidates:string[][]=[];
 for(const b of config.blocks){
  if(b.type!=='row'||b.header)continue;
  for(const group of b.groups as (string|Partial<Seat>|null)[][]){
   for(let i=0;i<=group.length-count;i++){
    const run=group.slice(i,i+count).map(cell=>cell===null?undefined:seats.find(s=>s.id===(typeof cell==='object'&&cell.id?cell.id:String(b.number)+(typeof cell==='string'?cell:cell.letter))));
    if(!run.every((s):s is Seat=>!!s&&!s.disabled&&!blocked.has(s.id)&&(!avoidExit||!s.exit)&&(cabin==='all'||s.cabin===cabin)))continue;
    if(preference==='window'&&!run.some(s=>s!.position==='window'&&!s!.noWindow))continue;
    if(preference==='aisle'&&!run.some(s=>s!.position==='aisle'))continue;
    candidates.push(run.map(s=>s!.id));
   }
  }
 }
 const supplied=(Array.isArray(suggestions)?suggestions:[]).filter(p=>p&&Array.isArray(p.seats)&&typeof p.reason==='string'&&candidates.some(c=>c.length===p.seats.length&&new Set(p.seats).size===c.length&&c.every(id=>p.seats.includes(id))));
 if(supplied.length)return supplied.slice(0,3);
 const reason=[count>1?'同排同侧相邻':'单人座位',preference==='window'?'包含靠窗座位':preference==='aisle'?'包含靠过道座位':'',avoidExit?'避开出口排':''].filter(Boolean).join(' · ');
 return candidates.slice(0,3).map(ids=>({seats:ids,reason}));
}
