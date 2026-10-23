Source: user supplied CabinKit, 2026-10-21. Original package remains unchanged.
DOM renderer retained; global IIFE converted to ESM. Fliggy styles and selection logic live in parent folder.
# CabinKit

不依賴框架的機艙俯視圖 DOM 組件。開啟 `index.html` 可查看組件、切換配置、增刪／排序元素及匯入匯出 JSON。`cathay-32p.html` 已使用同一套組件。

## 檔案

- `cabin-kit.js`：純視覺組件、配置驗證及組裝入口。
- `cabin-kit.css`：僅使用 `.ck-*` 命名空間的樣式，可透過 CSS 變數覆寫。
- `configurations.js`：國泰 32P 正式配置及兩個明確標示的結構示例。
- `index.html`：組件展示與組合工作台。

## 組件

`Seat`、`Aisle`、`SeatRow`、`SectionLabel`、`Exit`、`Facility`、`ServiceRow`、`Divider`、`Annotation`、`Spacer`、`Nose`、`Tail`、`AircraftCabin` 均回傳 DOM 元素，可獨立掛載。

```js
CabinKit.mount(container, {
  name: '自訂機艙', width: 500, aisleWidth: 32,
  blocks: [
    { type: 'section', title: '經濟艙', subtitle: '雙走廊示意' },
    { type: 'row', number: 20, groups: [['A','B'],['D','E','F'],['J','K']] },
    { type: 'exit', left: true, right: true },
    { type: 'services', items: [{ kind: 'lavatory', accessible: true }, { kind: 'galley' }] }
  ]
}, { onSeatSelect(seat, button) { /* 業務層自行處理詳情與選中狀態 */ } });
```

## 配置規則

- `blocks` 按機頭至機尾順序渲染；機頭及機尾由容器組件產生，可用 `nose.label`、`tail.label` 自訂文字。
- `row.groups` 中每個陣列是同一組座位，組與組之間自動插入走廊；支援任意組數。字母不綁定 A/K 或 C/H，位置按幾何分組推斷。
- 缺位用 `null` 保留該欄空間，如 32P 的 69 排左側；自訂位置可用座位物件覆寫 `position`。
- 座位可為字母或 `{ letter, id?, position?, noWindow?, recommended?, disabled? }`。ID 預設為排號加字母。
- 排級選項：`cabin`、`exit`、`wing`、`pitch`（排後間距 px）；`header:true` 顯示字母標籤、不產生座位。
- 服務設施組支援 `columns`、`items`，設施含 `kind`（lavatory/galley）、`accessible`、`label`、`span`；空位用 `null`。
- `renderSeat(data)` 可替換座位渲染，例如 32P 的觀景分析、篩選及比較功能由頁面處理，而非組件硬編碼。
- `validate(config)` 驗證組件類型、排結構與重複 ID，回傳座位總數及 ID 列表；`mount` 驗證成功後才替換原畫面。
- 多實例之間沒有共用選中狀態。外部狀態管理與持久化由呼叫端處理。

## 範圍

此為非等比例的結構及選位示意組件，非工程 CAD。機身寬度、走廊寬度與排間距可配置；不推斷真實機型的逃生門、窗戶或翼面位置。2–2、3–3–3 示例不是任何航空公司的真實配置。更換真實機型應另核對官方配置。

部署或移動時保留 `cabin-kit` 資料夾與 `cathay-32p.html` 的相對位置。

## 驗證

執行 `node configurations.test.cjs` 可核對座位總數、跳號、無窗位置及配置錯誤。組合工作台已實測雙走廊位置判定及新增／排序／刪除流程。

## A320 配置

`a320.js` 在配置集載入後註冊 `CabinConfigurations.a320`。`a320-180.json` 可直接匯入工作台。`../airbus-a320.html` 是以同一套組件組合的互動成品。此配置採 A320-200 180 座全經濟艙方案；排號、翼上出口所在排、機翼範圍及設施位置均為示意，非特定航司座位圖。
