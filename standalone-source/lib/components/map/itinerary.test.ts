import { describe,it,expect } from 'vitest';
import { createParser } from '@openuidev/react-lang';
import { library } from '../../library';
import { itineraryStopSchema } from './itinerary';
describe('linked itinerary contract',()=>{
 it('accepts return visits with distinct ids and identical coordinates',()=>{
  const stops=[{id:'start',name:'酒店',lat:30.27,lng:120.06,time:'09:00',description:'出发'},{id:'return',name:'酒店',lat:30.27,lng:120.06,time:'18:00',description:'返回'}];
  const result=createParser(library.toJSONSchema()).parse(`root = Col([ItineraryMap("一日游", ${JSON.stringify(stops)}, "地图与行程")])`);
  expect(result.meta.errors).toEqual([]);expect(result.root).toBeTruthy();
 });
 it('rejects invalid coordinates',()=>{
  expect(itineraryStopSchema.safeParse({id:'bad',name:'地点',lat:120,lng:200,time:'09:00',description:'测试'}).success).toBe(false);
 });
});
