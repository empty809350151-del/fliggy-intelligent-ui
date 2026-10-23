import { createLibrary } from "@openuidev/react-lang";
import { actions } from "../../src/lib/actions";
import { functions } from "../../src/lib/functions";
import "../../src/lib/components/theme.css";
import "../../src/lib/components/fliggy-colors.css";
import "../../src/lib/components/components.css";
import "../../src/lib/components/fliggy-typography.css";
import "../../src/lib/components/fliggy-buttons.css";
import "../../src/lib/components/fliggy-modules.css";
import "../../src/lib/components/fliggy-controls.css";
import { travelComponents } from "../../src/lib/components/travel";

import { Chart } from "../../src/lib/components/chart";
import { Carousel, Celebration, Code, Flashcard, MathBlock, Popover, Quote, YouTube } from "../../src/lib/components/extra";
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
} from "../../src/lib/components/controls";
import { HtmlView } from "../../src/lib/components/html-view";
import { Box, Card, Col, Divider, Form, Grid, Row, Spacer } from "../../src/lib/components/layout";

import { Icon, Image, SearchImage } from "../../src/lib/components/media";
import { svgComponents } from "../../src/lib/components/svg";
import { Table } from "../../src/lib/components/table";
import { Badge, Caption, Label, Link, List, ListItem, Markdown, Text, Title } from "../../src/lib/components/text";

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
    SearchImage, Image, Icon, Table, Chart, YouTube,
    Flashcard, Celebration,
    ...svgComponents, HtmlView,
    ...travelComponents,
  ],
  functions,
  actions,
  componentGroups: [
    { name: "Fliggy travel modules", components: ["TravelModule", "TravelItem", "DayBadge", "Price", "FieldRow"], notes: [
      "Use TravelModule for travel cards, TravelItem for POI/product/day rows, DayBadge for itinerary media, Price only for prices, FieldRow for labeled data and controls. Reuse existing interactive controls in slots; never invent bookings.",
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
    { name: "Media and data", components: ["SearchImage", "Image", "Icon", "Table", "Chart", "YouTube"] },
    { name: "Play", components: ["Flashcard", "Celebration"] },
    { name: "Drawing", components: ["Svg", "G", "Circle", "Ellipse", "Rect", "Line", "Path", "Polyline", "Polygon", "SvgText", "HtmlView"] },
  ],
});

