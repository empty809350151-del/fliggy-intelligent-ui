import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {notFound} from 'next/navigation';
import {SavedExample} from './saved-example';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^(?:(generic|ota)-(knowledge|explore|compare|travel|budget|howto|learn|sales|create|play)|component-(map|checklist|pet-hotel)|ota-(sanya-day|west-checklist|family-pet|team-split|reschedule))$/.test(id))notFound();
 let example;
 try{example=JSON.parse(await readFile(join(process.cwd(),'public/scenario-examples',id+'.json'),'utf8'))}catch{notFound()}
 return <SavedExample title={example.title} program={example.program}/>;
}
