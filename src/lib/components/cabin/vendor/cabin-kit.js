/* CabinKit: framework-free, composable DOM components. No airline-specific rules. */
const CabinKit = (() => {
  'use strict';
  const node=(tag,cls,text)=>{const el=document.createElement(tag);el.className=cls;if(text!==undefined)el.textContent=text;return el;};
  function Seat(data, options={}) {
    const el=node('button','ck-seat',data.letter);el.type='button';el.dataset.seat=data.id;
    const category=data.noWindow?'no-window':data.recommended?'recommended':data.cabin==='business'?'business':data.position;
    el.classList.add('ck-'+category);if(data.exit)el.classList.add('ck-exit-seat');
    el.setAttribute('aria-label',`${data.id} ${data.noWindow?'无窗':({window:'靠窗',aisle:'过道',middle:'中间'}[data.position]||'座位')}${data.exit?' · 紧急出口排':''}`);
    el.setAttribute('aria-pressed','false');el.disabled=Boolean(data.disabled);
    el.addEventListener('click',()=>options.onSeatSelect?.(data,el));return el;
  }
  function Aisle({label='过道'}={}) {return node('span','ck-aisle',label);}
  function SeatRow(spec, options={}) {
    const el=node('div','ck-row'+(spec.wing?' ck-wing':''));el.dataset.row=spec.number;
    const columns=[];spec.groups.forEach((group,i)=>{if(i)columns.push('var(--ck-aisle-width,32px)');group.forEach(()=>columns.push('minmax(0,1fr)'));});
    el.style.gridTemplateColumns=columns.join(' ');if(spec.pitch)el.style.marginBottom=spec.pitch+'px';
    spec.groups.forEach((group,groupIndex)=>{
      if(groupIndex)el.append(Aisle({label:spec.header?'过道':String(spec.rowLabel??spec.number)}));
      group.forEach((cell,index)=>{
        if(cell===null){el.append(node('span','ck-empty'));return;}
        const entry=typeof cell==='string'?{letter:cell}:cell;
        if(spec.header){el.append(node('span','ck-letter',entry.letter));return;}
        const position=(groupIndex===0&&index===0)||(groupIndex===spec.groups.length-1&&index===group.length-1)?'window':(index===0&&groupIndex>0)||(index===group.length-1&&groupIndex<spec.groups.length-1)?'aisle':'middle';
        const data={id:String(spec.number)+entry.letter,row:spec.number,letter:entry.letter,cabin:spec.cabin||'economy',position,wing:!!spec.wing,exit:!!spec.exit,...entry};
        el.append(options.renderSeat?options.renderSeat(data):Seat(data,options));
      });
    });
    if(spec.groups.length===1){el.setAttribute('aria-label','第 '+spec.number+' 排');const n=node('span','ck-single-row-number',spec.number);el.prepend(n);}
    return el;
  }
  function SectionLabel({title,subtitle=''}) {const el=node('div','ck-section');el.append(node('strong','',title),node('small','',subtitle));return el;}
  function Exit({left=true,right=true,label='紧急出口'}={}) {const el=node('div','ck-exits');el.append(node('span','',left?'↖ '+label:''),node('span','',right?label+' ↗':''));return el;}
  function Facility({kind='lavatory',label,span=1,accessible=false}={}) {const el=node('div','ck-facility');el.style.gridColumn='span '+span;el.dataset.kind=kind;el.append(node('span','ck-symbol',accessible?'♿':kind==='galley'?'▤':'WC'),node('span','',label||(kind==='galley'?'备餐间':'洗手间')));return el;}
  function ServiceRow({items,columns=items.length}) {const el=node('div','ck-services');el.style.gridTemplateColumns=`repeat(${columns},minmax(0,1fr))`;items.forEach(item=>el.append(item===null?node('span','ck-empty'):Facility(item)));return el;}
  function Divider({label=''}={}) {return node('div','ck-divider',label);}
  function Annotation({text}) {return node('div','ck-note',text);}
  function Spacer({height=16}={}) {const el=node('div','ck-spacer');el.style.height=height+'px';return el;}
  function Nose({label='↑ 机头方向'}={}) {return node('div','ck-nose',label);}
  function Tail({label='机尾'}={}) {return node('div','ck-tail',label);}
  const components={row:SeatRow,section:SectionLabel,exit:Exit,services:ServiceRow,divider:Divider,note:Annotation,spacer:Spacer};
  function validate(config){
    if(!config||!Array.isArray(config.blocks))throw new Error('配置必须包含 blocks 数组');
    const ids=new Set();let seats=0;
    for(const b of config.blocks){
      if(!components[b.type])throw new Error('未知组件：'+b.type);
      if(b.type==='row'){
        if(!Array.isArray(b.groups)||!b.groups.length||b.groups.some(g=>!Array.isArray(g)||!g.length))throw new Error('座位排必须有非空的 groups');
        if(!b.header&&b.number===undefined)throw new Error('座位排缺少 number');
        if(!b.header)for(const group of b.groups)for(const cell of group){if(cell===null)continue;const letter=typeof cell==='string'?cell:cell.letter;if(!letter)throw new Error('座位缺少 letter');const id=typeof cell==='object'&&cell.id?cell.id:String(b.number)+letter;if(ids.has(id))throw new Error('重复座位：'+id);ids.add(id);seats++;}
      }
      if(b.type==='services'&&(!Array.isArray(b.items)||!b.items.length))throw new Error('服务区缺少 items');
    }
    return {seats,ids:[...ids]};
  }
  function AircraftCabin(config,options={}){
    const stats=validate(config);const el=node('div','ck-cabin');el.setAttribute('aria-label',config.name||'机舱俯视图');
    el.style.setProperty('--ck-width',(config.width||360)+'px');el.style.setProperty('--ck-aisle-width',(config.aisleWidth||32)+'px');
    el.append(Nose(config.nose));const hull=node('div','ck-hull');config.blocks.forEach(b=>hull.append(components[b.type](b,options)));el.append(hull,Tail(config.tail));el.dataset.seatCount=stats.seats;
    return el;
  }
  function mount(target,config,options={}) {const el=AircraftCabin(config,options);target.replaceChildren(el);return el;}
  return Object.freeze({Seat,Aisle,SeatRow,SectionLabel,Exit,Facility,ServiceRow,Divider,Annotation,Spacer,Nose,Tail,AircraftCabin,mount,validate});
})();
export { CabinKit };
