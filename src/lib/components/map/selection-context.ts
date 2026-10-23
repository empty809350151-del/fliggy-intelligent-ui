"use client";
import { createContext } from "react";
/** Internal bridge: itinerary owns selection; standalone maps keep their state field. */
export const MapSelectionContext = createContext<{value:string;setValue:(value:string)=>void}|null>(null);
