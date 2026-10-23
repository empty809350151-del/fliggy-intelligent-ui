import {seatPlans} from './model';
import {describe,it,expect} from 'vitest';
import {cabinPresets,seatsOf,recommendations,toggleSeat} from './model';
import {CabinKit} from './vendor/cabin-kit';
import {createParser} from '@openuidev/react-lang';
import {library} from '../../library';
describe('CabinKit integration',()=>{
 it('links preferred groups to valid economy adjacency and rejects invalid model suggestions',()=>{
  const config=cabinPresets.csairA32032h;
  expect(()=>seatPlans(config,'window',2,new Set(),false,'economy',[null,{}, {seats:null}] as never)).not.toThrow();
  const plans=seatPlans(config,'window',2,new Set(),false,'economy');
  expect(plans[0].seats).toEqual(['31A','31B']);
  expect(plans.every(p=>p.seats.every(id=>!id.startsWith('25')))).toBe(true);
  expect(seatPlans(config,'window',2,new Set(),false,'economy',[{seats:['32A','32B'],reason:'同排靠窗'}])[0].seats).toEqual(['32A','32B']);
  for(const ids of [['31C','31H'],['999A','999B'],['5A','5C'],['31A','31A']])expect(seatPlans(config,'window',2,new Set(),false,'economy',[{seats:ids,reason:'无效'}])[0].reason).not.toBe('无效');
  expect(seatPlans(config,'window',2,new Set(['31A']),false,'economy').flatMap(p=>p.seats)).not.toContain('31A');
  expect(seatPlans(config,'together',2,new Set(),true,'economy',[{seats:['49A','49B'],reason:'出口'}])[0].reason).not.toBe('出口');
 });
 it('preserves transcribed airline capacities, row skips and seat letters',()=>{
  const ca=seatsOf(cabinPresets.airchinaA320158),cz=seatsOf(cabinPresets.csairA32032h),hu=seatsOf(cabinPresets.hainanA320neo172);
  expect(ca).toHaveLength(158);expect(cz).toHaveLength(166);expect(hu).toHaveLength(172);
  expect(ca.filter(s=>s.cabin==='business')).toHaveLength(8);
  expect(cz.filter(s=>s.cabin==='premium')).toHaveLength(24);
  expect(ca.some(s=>s.id==='35L')).toBe(true);expect(cz.some(s=>s.row===51)).toBe(false);
  expect(cz.filter(s=>s.exit).map(s=>s.row)).toEqual([49,49,49,49,49,49,50,50,50,50,50,50]);
  expect(hu.filter(s=>s.cabin==='business').map(s=>s.id)).toEqual(['公务舱A','公务舱C','公务舱H','公务舱K']);
  for(const key of ['airchinaA320158','csairA32032h','hainanA320neo172'])expect(CabinKit.validate(cabinPresets[key]).seats).toBe(seatsOf(cabinPresets[key]).length);
 });
 it('preserves supplied topology and missing seats',()=>{
  expect(seatsOf(cabinPresets.cathay32p)).toHaveLength(195);expect(seatsOf(cabinPresets.a320)).toHaveLength(180);
  const seats=seatsOf(cabinPresets.cathay32p);expect(seats.find(s=>s.id==='69A')).toBeUndefined();expect(seats.find(s=>s.id==='60A')?.noWindow).toBe(true);
 });
 it('does not suggest windowless, blocked or excluded exit seats',()=>{
  const ids=recommendations(cabinPresets.cathay32p,'window',1,new Set(['40A']),true);
  expect(ids.has('60A')).toBe(false);expect(ids.has('40A')).toBe(false);expect(ids.has('49A')).toBe(false);expect(ids.has('41A')).toBe(true);
 });
 it('does not join groups across an aisle or bridge a missing seat',()=>{
  const config={name:'test',blocks:[{type:'row',number:1,groups:[['A','B'],['D','E']]},{type:'row',number:2,groups:[['A',null,'C']]}]};
  expect(recommendations(config,'together',3,new Set(),false).size).toBe(0);
  expect([...recommendations(config,'together',2,new Set(['1A']),false)]).toEqual(['1D','1E']);
 });
 it('enforces selection limit and allows deselection',()=>{
  expect(toggleSeat(['1A'],'1B',1)).toEqual(['1A']);expect(toggleSeat(['1A'],'1A',1)).toEqual([]);
 });
 it('validates duplicate seat ids in custom layouts',()=>{
  expect(()=>CabinKit.validate({blocks:[{type:'row',number:1,groups:[['A','A']]}]})).toThrow();
 });
 it('parses presets and composable custom blocks against generated library',()=>{
  const parser=createParser(library.toJSONSchema());
  for(const preset of ['airchinaA320158','csairA32032h','hainanA320neo172'])expect(parser.parse(`root = Col([CabinView("选座", "${preset}")])`).meta.errors).toEqual([]);
  for(const source of ['root = Col([CabinView("选座", "a320")])','root = Col([CabinView("自定义示意", "custom", [CabinSection("经济舱"), CabinRow(1, [["A","B"],["C","D"]]), CabinServices([{kind:"galley"}])])])']){
   const parsed=parser.parse(source);expect(parsed.meta.errors).toEqual([]);expect(parsed.root).toBeTruthy();
  }
 });
});
