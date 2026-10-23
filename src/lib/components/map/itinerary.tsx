"use client";
import { defineComponent, useIsStreaming } from "@openuidev/react-lang";
import { useEffect, useRef, useState } from "react";
import { z } from "zod/v4";
import { MapSelectionContext } from "./selection-context";
import "./itinerary.css";

export const itineraryStopSchema = z.object({
  id: z.string(), name: z.string(), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180),
  time: z.string(), description: z.string(), transport: z.string().optional(), duration: z.string().optional(),
});
export const ItineraryMap = defineComponent({
  name: "ItineraryMap",
  props: z.object({ title: z.string(), stops: z.array(itineraryStopSchema), subtitle: z.string().optional() }),
  description: "One compact white module combining a map and itinerary with built-in two-way selection. Use whenever a trip has both a map and ordered stops; do NOT output a separate Map and itinerary TravelModule for the same trip. stops are plain objects with unique stable id, name, WGS84 lat/lng, time, description, optional transport/duration. Clicking a pin selects its details; clicking a stop focuses its pin. All stops remain available via numbered tabs, previous/next and collapsed overview. Coordinates must be known; do not invent exact locations. No extra Card wrapper needed.",
  component: ({props,renderNode}) => {
    const [selectedId,setSelectedId]=useState<string|null>(null);
    const streaming=useIsStreaming();
    // Ignore incomplete streamed records and duplicate IDs without breaking the module.
    const ids=new Set<string>();
    const stops=(props.stops??[]).filter(stop=>{
      if(!stop?.id||!stop.name||!Number.isFinite(stop.lat)||!Number.isFinite(stop.lng)||ids.has(stop.id))return false;
      ids.add(stop.id);return true;
    });
    const index=Math.max(0,stops.findIndex(stop=>stop.id===selectedId));
    const selected=stops[index];
    const tabs=useRef<HTMLElement>(null);
    useEffect(()=>{
      const button=tabs.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
      if(button&&tabs.current)tabs.current.scrollTo({left:button.offsetLeft-tabs.current.offsetLeft-(tabs.current.clientWidth-button.clientWidth)/2,behavior:"smooth"});
    },[selected?.id]);
    const label=(i:number)=>`${i+1}. ${stops[i].name}`;
    return <section className="iui-card iui-itinerary-map" aria-label={props.title}>
      <header><h3 className="iui-travel-heading">{props.title}</h3>{props.subtitle&&<p className="iui-travel-subtitle">{props.subtitle}</p>}</header>
      {selected ? <>
        <MapSelectionContext.Provider value={{value:label(index),setValue:value=>{
          const next=stops.findIndex((_,i)=>label(i)===value);if(next>=0)setSelectedId(stops[next].id);
        }}}>
          {renderNode({type:"element",typeName:"Map",props:{height:240,route:false,markers:stops.map((stop,i)=>({type:"element",typeName:"MapMarker",props:{label:label(i),lat:stop.lat,lng:stop.lng}}))}})}
        </MapSelectionContext.Provider>
        <nav ref={tabs} className="iui-itinerary-tabs" aria-label="行程地点">
          {stops.map((stop,i)=><button key={stop.id} type="button" disabled={streaming} aria-pressed={i===index} onClick={()=>setSelectedId(stop.id)}>{i+1}. {stop.name}</button>)}
        </nav>
        <article className="iui-itinerary-detail" aria-live="polite" data-stop-id={selected.id}>
          <span className="iui-itinerary-time">第 {index+1} 站 · {selected.time}</span>
          <h4>{selected.name}</h4><p>{selected.description}</p>
          <div className="iui-itinerary-meta">{selected.duration&&<span>{selected.duration}</span>}{selected.transport&&<span>{selected.transport}</span>}</div>
        </article>
        <div className="iui-itinerary-pager"><button type="button" disabled={streaming||index===0} onClick={()=>setSelectedId(stops[index-1].id)}>上一站</button><span>{index+1} / {stops.length}</span><button type="button" disabled={streaming||index===stops.length-1} onClick={()=>setSelectedId(stops[index+1].id)}>下一站</button></div>
        <details><summary>查看完整行程 · {stops.length} 站</summary><ol>{stops.map((stop,i)=><li key={stop.id}><button type="button" disabled={streaming} aria-pressed={i===index} onClick={()=>setSelectedId(stop.id)}>{stop.time} · {stop.name}</button></li>)}</ol></details>
      </>:<p role="status">正在整理行程地点…</p>}
    </section>;
  },
});
