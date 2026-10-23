"use client";

import { action, defineComponent, useFormName, useIsStreaming, useTriggerAction } from "@openuidev/react-lang";
import { z } from "zod/v4";
import assets from "../assets/fliggy/assets.json";
import { children, cx, webUrl } from "./style";
import { inline } from "./markdown";

/** Preserve SVG root geometry; the wrapper converts the 2× asset as a whole. */
function DesignIcon({ name, size }: { name: "flight" | "notice" | "refresh"; size: number }) {
  return <span className="iui-design-icon" style={{ width: size / 2, height: size / 2 }}>
    <img src={assets[name]} alt="" style={{ transform: "scale(.5)", transformOrigin: "top left", maxWidth: "none" }} />
  </span>;
}

export const TravelModule = defineComponent({
  name: "TravelModule",
  props: z.object({
    children,
    kind: z.enum(["product", "flight", "order", "poi", "itinerary", "budget", "form", "status", "notice", "choices", "table", "table-left", "media", "evidence", "followup"]).optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    actions: children.optional(),
    refresh: action().optional(),
  }),
  description: "Fliggy module. Compose existing controls inside: budget=Slider; choices=RadioGroup(list)/Checkbox; table=Table; form/order=FieldRow; product/poi/itinerary=TravelItem. actions is a footer of real Buttons. Never invent live prices or booking success.",
  component: ({ props, renderNode }) => {
    const kind = props.kind ?? "product";
    const trigger = useTriggerAction();
    const form = useFormName();
    const streaming = useIsStreaming();
    return <section className={cx("iui-card", "iui-travel-module", `iui-travel-${kind}`)}>
      {kind === "status" && <div className="iui-travel-status-icon"><DesignIcon name="flight" size={48} /></div>}
      {kind === "notice" && <DesignIcon name="notice" size={36} />}
      <div className="iui-travel-main">
        {(props.title || props.subtitle) && <header className="iui-travel-header">
          {props.title && <h3 className="iui-travel-heading">{inline(props.title)}</h3>}
          {props.subtitle && <p className="iui-travel-subtitle">{inline(props.subtitle)}</p>}
        </header>}
        <div className="iui-travel-content">{renderNode(props.children)}</div>
        {props.actions && <footer className="iui-travel-actions">{renderNode(props.actions)}</footer>}
      </div>
      {props.refresh && <button type="button" className="iui-travel-refresh" aria-label="刷新状态" disabled={streaming}
        onClick={() => void trigger("刷新状态", form, props.refresh as Parameters<typeof trigger>[2])}>
        <DesignIcon name="refresh" size={28} />
      </button>}
    </section>;
  },
});

export const TravelItem = defineComponent({
  name: "TravelItem",
  props: z.object({
    title: z.string(),
    description: z.string().optional(),
    media: children.optional(),
    children: children.optional(),
    actions: children.optional(),
    portrait: z.boolean().optional(),
    image: z.string().optional(),
  }),
  description: "Horizontal product/POI/day row inside TravelModule. media contains Image/SearchImage or DayBadge; never use arbitrary image URLs. portrait makes a product thumbnail tall. children holds badges, ratings or Price; actions holds Buttons.",
  component: ({ props, renderNode }) => <article className={cx("iui-travel-item", props.portrait && "iui-travel-item-portrait")}>
    {props.media ? <div className="iui-travel-thumbnail">{renderNode(props.media)}</div> :
      (props.image === "asset:fliggy-poi" || webUrl(props.image)) && <div className="iui-travel-thumbnail"><img src={props.image === "asset:fliggy-poi" ? assets.poi : webUrl(props.image)!} alt={props.title} /></div>}
    <div className="iui-travel-item-content">
      <h4 className="iui-travel-item-title">{inline(props.title)}</h4>
      {props.description && <p className="iui-travel-item-description">{inline(props.description)}</p>}
      {props.children && <div className="iui-travel-item-details">{renderNode(props.children)}</div>}
      {props.actions && <div className="iui-travel-item-actions">{renderNode(props.actions)}</div>}
    </div>
  </article>,
});

export const DayBadge = defineComponent({
  name: "DayBadge",
  props: z.object({ day: z.union([z.string(), z.number()]), date: z.string().optional() }),
  description: "Gradient DAY tile for TravelItem media. day is an itinerary day number, date is a short label.",
  component: ({ props }) => <div className="iui-day-badge">
    <span>DAY</span><strong>{String(props.day ?? "").padStart(2, "0")}</strong>
    {props.date && <span>{props.date}</span>}
  </div>,
});

export const Price = defineComponent({
  name: "Price",
  props: z.object({
    amount: z.union([z.number(), z.string()]),
    currency: z.string().optional(),
    suffix: z.string().optional(),
  }),
  description: "Explicit travel price, orange with a smaller currency symbol. Only for actual prices or clearly labeled estimates, not arbitrary KPI numbers.",
  component: ({ props }) => <span className="iui-price">
    <span className="iui-price-currency">{props.currency ?? "¥"}</span>
    <strong>{typeof props.amount === "number" ? props.amount.toLocaleString("zh-CN", { maximumFractionDigits: 2 }) : props.amount}</strong>
    {props.suffix && <span className="iui-price-suffix">{props.suffix}</span>}
  </span>,
});

export const FieldRow = defineComponent({
  name: "FieldRow",
  props: z.object({ label: z.string(), children, note: z.string().optional(), error: z.string().optional() }),
  description: "Two-column labeled row for order details or form fields. Put a labeled Input/Select in children for editing; note is helper text, error is a validation message.",
  component: ({ props, renderNode }) => <div className="iui-travel-field">
    <div className="iui-travel-field-label">{props.label}</div>
    <div className="iui-travel-field-content">
      {renderNode(props.children)}
      {props.note && <p className="iui-travel-field-note">{props.note}</p>}
      {props.error && <p className="iui-travel-field-error" role="alert">{props.error}</p>}
    </div>
  </div>,
});

export const travelComponents = [TravelModule, TravelItem, DayBadge, Price, FieldRow];
