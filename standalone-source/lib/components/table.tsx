"use client";

import { defineComponent } from "@openuidev/react-lang";
import { useRef, useState } from "react";
import assets from "../assets/fliggy/assets.json";
import { z } from "zod/v4";
import { inline } from "./markdown";
import { cx } from "./style";

const NUMERIC = /^[-+−]?[$€£¥₹]?\s?\d[\d,]*(\.\d+)?\s?(%|[kKmMbB]|bn)?$/;
const isElement = (value: unknown) => !!value && typeof value === "object" && (value as { type?: unknown }).type === "element";

export const Table = defineComponent({
  name: "Table",
  props: z.object({
    columns: z.array(z.string()),
    rows: z.array(z.array(z.any())),
    title: z.string().optional(),
    headerPosition: z.enum(["top", "left"]).optional(),
  }),
  description: "Each row lists its cells in column order; a cell may be a component. Number columns align right. Render directly without a Card/TravelModule wrapper. Optional title and headerPosition=left for row headings. Includes copy and expanded view.",
  component: ({ props, renderNode }) => {
    const dialog = useRef<HTMLDialogElement>(null);
    const host = useRef<HTMLDivElement>(null);
    const [copyStatus, setCopyStatus] = useState("");
    const columns = Array.isArray(props.columns) ? props.columns.map((c) => String(c ?? "")) : [];
    const rows = (Array.isArray(props.rows) ? props.rows : []).filter(Array.isArray) as unknown[][];
    // A column of numbers (or amounts like "$1.2k" and "45%") aligns right.
    const numeric = columns.map((_, c) => {
      const cells = rows.map((r) => r[c]).filter((v) => v != null && v !== "" && !(typeof v === "string" && /^(n\/a|\u2014|\u2013|-)$/i.test(v.trim())));
      return cells.length > 0 && cells.every((v) => typeof v === "number" || (typeof v === "string" && NUMERIC.test(v.trim())));
    });
    const cell = (value: unknown) =>
      isElement(value) ? renderNode(value) : typeof value === "number" ? value.toLocaleString("en-US", { maximumFractionDigits: 2 }) : inline(String(value ?? ""));
    const table = (
      <div className="iui-table-scroll">
        <table className="iui-table">
          {props.headerPosition !== "left" && <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={i} className={cx(numeric[i] && "is-numeric")}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>}
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                {columns.map((_, c) => (
                  props.headerPosition === "left" && c === 0 ? <th key={c} scope="row">{cell(row[c])}</th> : <td key={c} className={cx(numeric[c] && "is-numeric")}>{cell(row[c])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    const icon = (key: "table-copy" | "table-expand") => <span className="iui-table-icon"><img src={assets[key]} alt="" /></span>;
    const copy = async () => {
      const text = Array.from(host.current?.querySelectorAll("table tr") ?? []).map(row => Array.from(row.querySelectorAll("th,td")).map(c => (c.textContent ?? "").replace(/\s+/g, " ").trim()).join("\t")).join("\n");
      try {
        const input = document.createElement("textarea"); input.value = text; input.style.position = "fixed"; input.style.opacity = "0";
        const active = document.activeElement as HTMLElement | null;
        document.body.appendChild(input); input.select();
        let copied = false;
        try { copied = document.execCommand("copy"); } finally { input.remove(); active?.focus(); }
        if (!copied) {
          if (!navigator.clipboard?.writeText) throw new Error("copy");
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("copy timeout")), 3000);
            navigator.clipboard.writeText(text).then(() => { clearTimeout(timeout); resolve(); }, error => { clearTimeout(timeout); reject(error); });
          });
        }
        setCopyStatus("已复制");
      } catch { setCopyStatus("复制失败，请手动选择表格内容"); }
    };
    return <>
      <div ref={host} className={cx("iui-table-frame", props.headerPosition === "left" && "iui-table-left")}>
        <div className="iui-table-toolbar"><strong>{props.title ?? "表格"}</strong><div>
          <button type="button" onClick={copy}>{icon("table-copy")}复制</button>
          <button type="button" onClick={() => dialog.current?.showModal()}>{icon("table-expand")}全屏</button>
        </div></div>
        {copyStatus && <p className="iui-table-status" role="status">{copyStatus}</p>}
        {table}
      </div>
      <dialog ref={dialog} className="iui-table-dialog" aria-label={props.title ?? "表格全屏"}>
        <div className="iui-table-toolbar"><strong>{props.title ?? "表格"}</strong><button type="button" onClick={() => dialog.current?.close()}>关闭全屏</button></div>
        {table}
      </dialog>
    </>;
  },
});
