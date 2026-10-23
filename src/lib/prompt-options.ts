import type { PromptOptions } from "@openuidev/react-lang";
import { demoToolSpecs } from "./demo-data";

/**
 * Prompt options that teach the model to answer with working tools: the page
 * holds its inputs and lists in $variables and computes with @functions, so
 * it works without sending anything back to the assistant.
 */

export const exampleShoppingList = `root = Card([title, stepper, list, copy])
$guests = 4
$got = []
title = Title("Pasta night for " + @Plural($guests, "guest"), "lg")
stepper = Row([IconButton("minus", @Set($guests, @Clamp($guests - 1, 1, 20)), "Fewer"), Text($guests + "", "lg", null, "semibold"), IconButton("plus", @Set($guests, @Clamp($guests + 1, 1, 20)), "More")], 3)
lines = @Each(base, "i", {name: i.name, qty: @Round(i.qty * $guests / 4) + i.unit})
list = Col(@Each(lines, "l", Pressable([Row([Icon(@Includes($got, l.name) ? "check-circle" : "circle", "sm"), Text(l.qty + " " + l.name, "sm", null, null, false, @Includes($got, l.name))], 2)], @Set($got, @Toggle($got, l.name)), @Includes($got, l.name), 2)), 1)
copy = Button("Copy list", @CopyToClipboard(@Join(@Each(lines, "l", l.qty + " " + l.name), "\\n")), "outline", null, "sm", "copy")
base = [{name: "spaghetti", qty: 400, unit: " g"}, {name: "tomatoes", qty: 6, unit: ""}, {name: "parmesan", qty: 80, unit: " g"}]`;

export const exampleTrip = `root = Col([title, intro, photos, facts, Title("Day by day", "md"), days, prefs])
$pace = "Relaxed"
title = Title("Three days in Lisbon", "xl")
intro = Text("Hills, tiled facades and the Tagus: start in **Alfama**, give a day to Belém, then take the train to Sintra.")
photos = Carousel([SearchImage("Alfama Lisbon", 1.25), SearchImage("Belém Tower", 1.25), SearchImage("Pena Palace", 1.25)], 260)
facts = Row([Badge("Best in April to June"), Badge("Tram 28", "info"), Badge("About €120 a day", "success")], 2, null, null, true)
days = Col(@Each(plan, "d", Row([Box([SearchImage(d.place, 1, "lg")], null, null, null, null, null, null, 96), Col([Text([Icon("map-pin", "sm"), " Day " + d.day + " · " + d.title], "md", null, "semibold"), Text(d.text, "sm", "muted")], 1)], 4, "start")), 4)
prefs = Card([Title("Make it yours", "sm"), Form([RadioGroup($pace, ["Relaxed", "Packed"], "Pace", "pills"), Button("Plan my trip", @ToAssistant("Tailor my Lisbon trip"))])], "soft")
plan = [{day: 1, title: "Alfama", place: "São Jorge Castle", text: "Climb to the castle, then lunch on grilled sardines."}, {day: 2, title: "Belém", place: "Jerónimos Monastery", text: "The monastery, the tower and pastéis de Belém."}, {day: 3, title: "Sintra", place: "Pena Palace", text: "Train from Rossio; book the palace for 9 AM."}]`;

export const exampleSteps = `root = Col([head, viewer, strip])
$step = 0
head = Col([Title("Build a small bookcase", "xl"), Text("Four steps and about 30 minutes. You need the Allen key from the box and a hammer.", "md", "muted")], 2)
steps = [{title: "Lay out the parts", text: "Two sides, the top, one shelf and the bottom. Tap the 12 wooden dowels into the holes on the sides."}, {title: "Fix the boards to one side", text: "Push the top, shelf and bottom onto one side's dowels, then turn each cam lock clockwise until it pulls tight."}, {title: "Add the other side", text: "Fit the second side onto the free dowels and tighten its cam locks the same way."}, {title: "Nail on the back", text: "Lay it face down, check the corners are square, then nail the back panel about every 10 cm."}]
s0 = Svg([Rect(16, 20, 22, 120, "surface", "ink", 2), Rect(48, 20, 22, 120, "surface", "ink", 2), Rect(100, 28, 120, 16, "surface", "ink", 2), Rect(100, 68, 120, 16, "surface", "ink", 2), Rect(100, 108, 120, 16, "surface", "ink", 2), Circle(27, 36, 3, "chart1"), Circle(27, 80, 3, "chart1"), Circle(27, 124, 3, "chart1"), SvgText("Sides", 43, 154, 11, "muted", "middle"), SvgText("Top", 160, 22, 11, "muted", "middle"), SvgText("Shelf", 160, 62, 11, "muted", "middle"), SvgText("Bottom", 160, 102, 11, "muted", "middle")], "0 0 240 160")
s1 = Svg([Rect(40, 16, 18, 128, "surface", "ink", 2), Rect(58, 16, 130, 14, "surface", "ink", 2), Rect(58, 72, 130, 14, "surface", "ink", 2), Rect(58, 130, 130, 14, "surface", "ink", 2), Circle(68, 23, 4, "info"), Circle(68, 79, 4, "info"), Circle(68, 137, 4, "info"), Line(212, 79, 196, 79, "info", 2), Polygon("192,79 200,74 200,84", "info"), SvgText("Cam lock", 74, 104, 11, "info")], "0 0 240 160")
s2 = Svg([Rect(40, 16, 18, 128, "surface", "ink", 2), Rect(58, 16, 130, 14, "surface", "ink", 2), Rect(58, 72, 130, 14, "surface", "ink", 2), Rect(58, 130, 130, 14, "surface", "ink", 2), Rect(196, 16, 18, 128, "surface", "info", 2), Line(232, 80, 220, 80, "info", 2), Polygon("216,80 224,75 224,85", "info")], "0 0 240 160")
s3 = Svg([Rect(40, 16, 160, 128, "#EFE9DF", "ink", 2), Rect(40, 16, 160, 14, "surface", "ink", 2), Rect(40, 72, 160, 14, "surface", "ink", 2), Rect(40, 130, 160, 14, "surface", "ink", 2), Circle(48, 50, 2.5, "ink"), Circle(192, 50, 2.5, "ink"), Circle(48, 108, 2.5, "ink"), Circle(192, 108, 2.5, "ink"), SvgText("Back panel", 120, 56, 11, "muted", "middle")], "0 0 240 160")
drawings = [s0, s1, s2, s3]
viewer = Card([Row([Badge("Step " + ($step + 1) + " of 4", "info"), Spacer(), Caption(@Percent($step + 1, 4) + "% done")], 2), Box([drawings[$step]], null, null, 3, "surface", "lg"), Title(steps[$step].title, "md"), Text(steps[$step].text, "sm"), Row([Button("Back", @Set($step, @Clamp($step - 1, 0, 3)), "outline", null, null, "arrow-left", $step == 0), Spacer(), Button("Next step", @Set($step, @Clamp($step + 1, 0, 3)), "solid", null, null, "arrow-right", $step == 3)], 2)], null, 4, 3)
strip = Grid(@Each(@Range(0, 4), "i", Pressable([drawings[i], Caption((i + 1) + ". " + steps[i].title)], @Set($step, i), i == $step, 2)), 4, 110, 2)`;

export const exampleDashboard = `root = Col([head, kpis, Grid([weekly, byRegion], 2, 280, 4), top])
$region = "All"
orders = Query("get_orders", {days: 90}, {rows: []})
rows = $region == "All" ? orders.rows : @Filter(orders.rows, "region", "==", $region)
head = Row([Title("Sales, last 90 days", "lg"), Spacer(), SegmentedControl($region, ["All", "North", "South", "East", "West"])], 3, null, null, true)
kpis = Grid([Card([Caption("Revenue"), Title(@Format(@Sum(rows.amount), "compact", 1, "USD"), "xl")]), Card([Caption("Orders"), Title(@Format(@Count(rows)), "xl")])], 2, 160, 3)
weekly = Card([Title("Revenue by week", "sm"), Chart("line", @Bucket(rows, "date", "week", "amount"), "key", ["value"], "currency")])
byRegion = Card([Title("By region", "sm"), Chart("donut", @GroupBy(orders.rows, "region", "amount"), "key", ["value"], "currency")])
top = Table(["Product", "Revenue"], @Each(@Top(@GroupBy(rows, "product", "amount"), "value", 5), "p", [p.key, @Format(p.value, "currency")]))`;

export const exampleCompactBudget = `root = Col([intro, tool, interpretation, closing])
intro = Text("先把总预算与人数定下来，就能看出每个人大约承担多少。下面的住宿与交通金额仅为可修改的估算，不是实时报价。")
tool = TravelModule([Row([Input($people, "人数", "number"), Input($budget, "总预算（元）", "number")], 2), Text("预计总支出 ¥" + total + " · 人均 ¥" + perPerson, "md", "ink", "medium"), Text(total > budget ? "超过预算 ¥" + (total - budget) : "预算剩余 ¥" + (budget - total), "sm"), Button($details ? "收起费用明细" : "调整费用明细", @Set($details, !$details), "ghost"), $details ? Col([Input($hotel, "住宿估算（元）", "number"), Input($transport, "交通估算（元）", "number")], 3) : null], "budget", "旅行预算", "金额可调整，结果即时更新")
interpretation = Text(total > budget ? "目前估算超出预算。可以在同一个工具中展开明细，优先调整住宿或交通费用，再看人均金额如何变化。" : "目前估算在预算内。剩余部分还需要覆盖餐饮和门票，建议不要全部用于升级住宿。")
closing = Text("如果已有机票或酒店报价，用实际金额替换估算后再决定；这里不会创建订单。")
people = @Clamp(@Default($people, 1), 1, 100)
budget = @Clamp(@Default($budget, 0), 0, 1000000)
total = @Clamp(@Default($hotel, 0), 0, 1000000) + @Clamp(@Default($transport, 0), 0, 1000000)
perPerson = @Round(total / people)
$people = 3
$budget = 6000
$hotel = 2400
$transport = 1800
$details = false`;

const rules = [
  "Cabin recommendations MUST be linked to UI: pass passengers from the request, preference=window for 靠窗 (even with companions), aisle for 靠过道, together ONLY if neither window nor aisle is requested; every multi-passenger option automatically enforces adjacency, and cabin from the user or economy by default. Exact suggested seat groups and reasons belong in CabinView suggestions; the component validates, highlights, locates and selects these groups. Otherwise let its built-in planner derive valid groups. Do NOT write a separate static list of recommended seats or static selected seats outside the module; use its built-in linked recommendation and selection summaries, or bind an external selected summary to the same $seats. Never infer an aircraft from airline alone, including 南航: first ask aircraft/configuration, unless the user explicitly agrees to a named illustrative configuration.",
  "Use CabinView for airline-specific interactive cabin layouts, not raw images: airchinaA320158=国航/CA A320 158 seats (8+150); csairA32032h=南航/CZ A320 32H 166 (4+24+138); hainanA320neo172=海航/HU A320neo layout 1 172 (4+168); cathay32p=国泰/CX A321neo 32P 195 (12+183). These presets are transcribed from the supplied atlas; exact airline, model and version must match. Never substitute generic a320 180. Ask when version differs or is unknown. HU business row number is not given in the source; use its provided position IDs without inventing row numbers. These are interactive reference layouts, not live inventory or guaranteed current flight configurations.",
  "Use Simplified Chinese for all Chinese response text and UI labels, including cabin sections, facilities, seat descriptions and accessibility labels. Do not use Traditional Chinese. Keep aircraft codes and seat identifiers unchanged.",
  "For check-in/seat-choice tasks use CabinView with the named aircraft configuration. Never choose a different aircraft silently. Available presets: cathay32p (provided CX A321neo 32P), a320 (generic 180-seat schematic), regional (2-2 example), widebody (3-3-3 example). Unknown real airline layouts require clarification or explicitly agreed schematic; custom composition uses CabinRow/Section/Exit/Services/Note/Divider/Spacer blocks from supplied geometry. Bind selected to $seats when external summary is needed. Preference window/aisle/together and passenger count drive local recommendations; together means adjacent within one seat group, never across an aisle. Use avoidExit=true for travel with children. Do not invent live seat availability, fees, eligibility or check-in success. Explain limitations in normal text outside the module.",
  "Forms use Fliggy inline field rows: FieldRow(label, [Input($value, label, type, placeholder)], note, error). Put rows vertically in a TravelModule of kind form; no redundant visible Label/Text above a field, no narrow side-by-side form columns. Input retains its accessible label and reactive state. Show derived summaries to confirm edits; use supplied values or empty fields rather than invented personal details.",
  "For an itinerary that includes geographic places, use ItineraryMap(title, stops, subtitle) to combine map and stop details in ONE linked module. Each stop is a plain object {id, name, lat, lng, time, description, transport, duration}. Use unique stable IDs and known WGS84 coordinates. Built-in pin/detail selection, previous/next and collapsed overview keep it compact. Never split the same itinerary into a separate Map and TravelModule. Keep explanations outside this module; do not claim navigation or live traffic.",
  "Render standalone comparisons directly with Table(columns, rows, title, headerPosition). Do not wrap Table in Card or TravelModule of kind table/table-left just for a white surface. headerPosition left uses the first cell of each row as the row heading; top is default. The table itself provides its title, copy and expanded view controls. A table belonging to an interactive tool may stay inside that unified tool.",
  "Group UI by ONE user task, not by component type. Shared inputs, dependent calculations, results and primary actions belong in ONE Card or TravelModule. Never split parameters, totals, per-person results or controls for the same calculation into sibling cards. Use unboxed Row/Col/Divider within a tool, not nested Card/TravelModule. Split tools only when they have independent goals; explain their relation in standalone prose.",
  "Keep each unified tool compact on a 390px phone: initially show only 2–4 essential controls, one concise result summary (at most 3 short metrics) and one primary action. More than 3 result metrics MUST be hidden behind an explicit details toggle or a section switch; do not render a long summary list by default. Do not repeat the same status in a badge, a paragraph and a result row. With 4 controls, keep the result to 1–2 lines and move all breakdowns behind Show details. Aim for roughly one phone viewport (about 600 CSS px of content), not a hard height. If longer, use SegmentedControl + conditional content for task sections, a clearly labeled Show details/Hide details Button with a boolean variable, or step navigation. Keep shared values and a compact result visible when switching. Never hide required input errors or critical caveats; never clip overflow, shrink approved fonts, or move related content to separate cards just to shorten it. Long lists show a short preview plus an explicit expand control. Do not add tabs to a tool already compact enough.",
  "Compose a helpful conversation, not a dashboard. Answer directly in standalone Text or Markdown, then interleave independent tools with substantive prose that explains their purpose, interprets results, and connects the next topic. Prose belongs outside Card/TravelModule/Box/Grid. Do not put all prose in a short opening followed by only cards. Use images only when they help the task; do not add decorative images to policy explanations or calculators.",
  "Spacing is a system with three tiers that always nest: inner (gap 1-2, 6px) for a title with its subtitle, tags or line; group (gap 3-4, 12-18px) between blocks inside a Card or grid cell; section (24px) between the blocks of the page. Leave gap unset on the page's root Col and on card contents: the app applies these tiers. Set a gap only on a Row or Grid. Never use one gap for everything, and never a gap larger than the section gap.",
  "A photo beside text is a media row: Row([Box([SearchImage(query, 1.33)]), Col([Title(..., \"md\"), Row([Badge(...), Badge(...)], 1, null, null, true), Text(..., \"sm\")], 2)], 4, \"start\"). The app sizes the photo to a third of the row (at most 200px) and top-aligns the text. Facts are Badges, never Buttons or boxed pills.",
  "Every SearchImage query names the exact subject the user will recognise (\"flat-pack bookshelf assembly\", \"Sonoma Plaza\"), never a generic scene. If no photo would show the subject, use no image.",
  "Keep cards compact and scannable: Title \"md\" (never lg or xl inside a Card), Text \"sm\" for the body, at most one short paragraph, then facts as Badges or label/value rows (Caption label, Spacer, Text value). Don't write bold-lead paragraphs like \"**Weekend rhythm:** ...\" or long prose in a card. Cards side by side in a Grid share the same blocks in the same order and the same SearchImage aspect ratio, so they line up. For example: c = Card([SearchImage(\"Sonoma Plaza\", 1.5), Col([Title(\"Sonoma\", \"md\"), Row([Badge(\"1 h drive\", null, \"car\"), Badge(\"Wine country\", \"purple\")], 1, null, null, true)], 2), Text(\"A slow plaza, tasting rooms and quiet back roads.\", \"sm\"), Col([Row([Caption(\"Best for\"), Spacer(), Text(\"Food and wine\", \"sm\")]), Row([Caption(\"Trade-off\"), Spacer(), Text(\"Tastings add up\", \"sm\")])], 1)])",
  "Use a working tool only when user manipulation, calculation, comparison or selection adds value. The presence of numbers, lists or steps alone does not require UI: ordinary advice, explanations and caveats stay in standalone Text/Markdown. When a tool is useful, bind its inputs and computed results to shared $variables and @Set so it works without another message.",
  "Use @ToAssistant only for what the page cannot compute: a Form's submit Button, or a new request (\"Plan another day\"). Its message is short and first person, like the user typing it (\"Help me choose a bike\"); the form values travel with it, so never repeat them in the message.",
  "$variable defaults are literals (numbers, strings, lists, objects), never expressions or @calls. Edit lists with @Append, @Remove, @RemoveAt and @Update; track selections with @Toggle and @Includes.",
  "cond ? a : b also picks between components; there is no @If. Use only the listed @functions; you cannot define your own.",
  "Derive rows once in a statement with @Each(list, \"x\", {...}), then reuse them in @Each, Table, Chart, @Sum(rows.field) and @Join. @Each(@Range(0, n), \"i\", ...) builds a series or repeats a step.",
  "@Random, @Pick and @Shuffle give a new value on every evaluation: call them inside @Set, so a click draws once and the page stays still.",
  "Pick the medium that shows the idea: Chart for numbers across time or categories; Svg drawings for shapes, parts and movement; Map with MapMarker for places and routes; Table for comparisons; Flashcard and Celebration for learning and games; HtmlView only for a game or animation that needs a loop.",
  "Draw with Svg whenever the user would otherwise have to picture it: assembly and how-to steps (a simple drawing for each step, like an instruction leaflet), knots and folds, how a machine, mechanism or the body works, geometry and science diagrams, the layout of a room, garden or board, chord and clock faces. A photo shows what a thing looks like; a drawing shows how it goes together or works, so a how-to or how-it-works answer has drawings even when it also has a photo. Keep each drawing simple: a viewBox about 240 wide, a dozen or so shapes in the listed colors with SvgText labels, a Line with a small Polygon head for an arrow, and let $variables such as the current step drive it.",
  "Format money, percentages and big numbers with @Format, counts with @Plural and dates with @FormatDate.",
  "Dates relative to now (today, this week, next month) start from @Today(), never a fixed date. <, >, <= and >= compare numbers only, so order two dates with @DaysBetween(a, b) > 0.",
  "To change a page from an earlier answer, keep its $variable names and start them from that answer's \"context and form values\", so what the user typed, added or ticked carries over.",
  "Read a number input for a count or amount through @Default and @Clamp with a sensible minimum, e.g. @Clamp(@Default($people, 1), 1, 50), so 0, empty or negative cannot divide by zero or zero out the page.",
  "Answer a plain knowledge or safety question with Markdown text, adding a SearchImage or a Quote only where it helps.",
  "Only for travel content that benefits from an actual tool or structured comparison, use Fliggy modules (never turn every paragraph into notice/evidence/followup cards): TravelModule(children, kind, title, subtitle, actions, refresh), TravelItem(title, description, media, children, actions, portrait, image), DayBadge(day, date), Price(amount, currency, suffix), FieldRow(label, children, note, error). Kind is product/flight/order/poi/itinerary/budget/form/status/notice/choices/table/table-left/media/evidence/followup. Put existing bound controls and Buttons in slots; use Grid for two equal action buttons. Preserve approved typography and button rules; all badges use pale purple #EBEBFF with purple #6666FF text. Never emit asset:fliggy-poi in real answers; it is a gallery-only sample. Use Image/SearchImage for live media.",
];

/** The chat prompt: no tools, $variables and functions. */
export const promptOptions: PromptOptions = {
  bindings: true,
  additionalRules: rules,
  examples: [
    `Preferred mixed answer: prose around ONE compact tool; dependent inputs and result stay together, optional inputs expand in place:\n\n${exampleCompactBudget}`,
    `Example 1: A guest stepper that rescales a shopping list, with a checklist and a copy button:\n\n${exampleShoppingList}`,
    `Example 2: A composed trip answer: photos, facts, day rows and a short form:\n\n${exampleTrip}`,
    `Example 3: Step-by-step instructions with a drawing for each step, driven by $step:\n\n${exampleSteps}`,
  ],
};

/** For dashboards over the demo data tools: Query rows, shaped with the data functions. */
export const dashboardPromptOptions: PromptOptions = {
  ...promptOptions,
  tools: demoToolSpecs,
  toolExamples: [`Example 4: A live dashboard over Query rows:\n\n${exampleDashboard}`],
  additionalRules: [
    ...rules,
    "Fetch rows with Query and compute every number, group and series from them with @Sum, @Count, @GroupBy, @Bucket, @Top, @Stats and @Change. A filter is a $variable (from this library's Select or SegmentedControl) applied with @Filter; select dates and ranges with @Between, since @Filter's < and > compare numbers only.",
  ],
};
