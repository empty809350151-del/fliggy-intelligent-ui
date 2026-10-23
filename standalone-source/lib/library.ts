import { createLibrary } from "@openuidev/react-lang";
import { actions } from "./actions";
import { functions } from "./functions";
import "./components/theme.css";
import "./components/fliggy-colors.css";
import "./components/components.css";
import "./components/map/map.css";
import "./components/fliggy-typography.css";
import "./components/fliggy-buttons.css";
import "./components/fliggy-answer-text.css";
import "./components/fliggy-modules.css";
import "./components/fliggy-controls.css";
import "./components/fliggy-form-fields.css";
import { cabinComponents } from "./components/cabin/cabin";
import { travelComponents } from "./components/travel";
import { Chart } from "./components/chart";
import { Carousel, Celebration, Code, Flashcard, MathBlock, Popover, Quote, YouTube } from "./components/extra";
import {
  Button,
  Checkbox,
  DatePicker,
  IconButton,
  Input,
  Pressable,
  RadioGroup,
  SegmentedControl,
  Select,
  Slider,
  TextArea,
  Timer,
} from "./components/controls";
import { HtmlView } from "./components/html-view";
import { Box, Card, Col, Divider, Form, Grid, Row, Spacer } from "./components/layout";
import { ItineraryMap } from "./components/map/itinerary";
import { MapMarker, MapView } from "./components/map/map";
import { Icon, Image, SearchImage } from "./components/media";
import { svgComponents } from "./components/svg";
import { Table } from "./components/table";
import { Badge, Caption, Label, Link, List, ListItem, Markdown, Text, Title } from "./components/text";

/**
 * Primitives the model arranges itself, plus a few widgets for what a model
 * cannot draw (a street map, a sandboxed HTML page). Layout is never fixed here.
 * Generic @functions let a page compute with its own state, so an answer can be
 * a working tool rather than a form sent back to the assistant.
 */
export const library = createLibrary({
  root: "Col",
  components: [
    Col, Row, Box, Grid, Card, Carousel, Popover, Divider, Spacer,
    Title, Text, Caption, Label, Badge, Link, List, ListItem, Markdown, Quote, Code, MathBlock,
    Button, IconButton, Pressable, Input, TextArea, Select, SegmentedControl, Slider, Checkbox, RadioGroup, DatePicker, Timer, Form,
    SearchImage, Image, Icon, Table, Chart, MapView, MapMarker, ItineraryMap, YouTube,
    Flashcard, Celebration,
    ...svgComponents, HtmlView,
    ...travelComponents, ...cabinComponents,
  ],
  functions,
  actions,
  componentGroups: [
    {name:"Aircraft cabin composition",components:["CabinView","CabinRow","CabinSection","CabinExit","CabinServices","CabinNote","CabinDivider","CabinSpacer"],notes:["CabinView is the complete interactive shell. Other Cabin components are data-only blocks inside it, not standalone output. Known presets preserve supplied seat topology. Custom blocks compose seat groups, aisles, missing seats and facilities; clearly label unverified layouts as schematics."]},
    { name: "Fliggy travel modules", components: ["ItineraryMap", "TravelModule", "TravelItem", "DayBadge", "Price", "FieldRow"], notes: [
      "Use one TravelModule per independent task, grouping its related inputs, computed results and actions together. Interleave tools with standalone explanation text. Keep the default view compact; reveal optional detail in place with state and conditional content. Do not use modules for ordinary prose. Keep real data and all calculations in variables. Reuse existing Button, Slider, Input, RadioGroup, Checkbox, Table and Image within slots.",
      "Use product/poi for places, flight for tickets, order/form with FieldRow for labeled details, itinerary with DayBadge rows, budget with Slider, choices with bound RadioGroup/Checkbox. Do not invent booking or payment results.",
    ] },
    {
      name: "Layout",
      components: ["Col", "Row", "Box", "Grid", "Card", "Carousel", "Popover", "Divider", "Spacer"],
      notes: [
        '- gap and padding retain the original 4px argument scale, then snap to nearest Fliggy 1× spacing. Arguments 1/2/3/4/5/6/7/8/9/10/11/12 map to 6/6/12/18/18/24/30/30/36/42/42/48px. Ties round down; 0 stays 0; values above 48px retain legacy size. Length is px or a CSS length like "50%". Radius is "sm" (XS 3px), "md"/"lg" (S 6px), "xl" (M 12px), "full" or explicit px.',
        '- Color is "ink", "muted", "faint", "surface", "info", "success", "warning", "danger", "purple", "pink", "chart1" to "chart6", or a CSS color. As a background, status colors are soft tints.',
      ],
    },
    { name: "Text", components: ["Title", "Text", "Caption", "Label", "Badge", "Link", "List", "ListItem", "Markdown", "Quote", "Code", "Math"] },
    {
      name: "Inputs",
      components: ["Button", "IconButton", "Pressable", "Input", "TextArea", "Select", "SegmentedControl", "Slider", "Checkbox", "RadioGroup", "DatePicker", "Timer", "Form"],
      notes: [
        "- An input's first argument is its value, usually a $variable that other statements read.",
        '- Every input either changes something shown on the page, or sits in a Form whose submit Button sends a short first-person @ToAssistant ("Help me choose a bike"); the form values go with it. No dead inputs.',
      ],
    },
    { name: "Media and data", components: ["SearchImage", "Image", "Icon", "Table", "Chart", "Map", "MapMarker", "YouTube"] },
    { name: "Play", components: ["Flashcard", "Celebration"] },
    { name: "Drawing", components: ["Svg", "G", "Circle", "Ellipse", "Rect", "Line", "Path", "Polyline", "Polygon", "SvgText", "HtmlView"] },
  ],
});

// The CLI (npm run prompt) picks up these exports by name.
export { dashboardPromptOptions, promptOptions } from "./prompt-options";
