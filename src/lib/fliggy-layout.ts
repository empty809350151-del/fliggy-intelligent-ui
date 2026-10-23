import { createTheme } from "@openuidev/react-ui";

// Spacing uses supplied 1× values; radii retain the confirmed 2× conversion.
export const fliggyLayoutTheme = createTheme({
  // The host's old scale has a 2px base; snap actual sizes, not token indexes.
  space000: "0", space3xs: "6px", space2xs: "6px", spaceXs: "6px",
  spaceS: "6px", spaceSM: "12px", spaceM: "12px", spaceML: "18px",
  spaceL: "18px", spaceXl: "24px", space2xl: "36px", space3xl: "48px",
  radiusNone: "0", radius3xs: "3px", radius2xs: "3px", radiusXs: "3px",
  radiusS: "6px", radiusM: "12px", radiusL: "12px", radiusXl: "12px",
  radius2xl: "12px", radius3xl: "12px", radius4xl: "12px",
  radius5xl: "12px", radius6xl: "12px", radius7xl: "12px",
  radius8xl: "12px", radius9xl: "12px", radiusFull: "9999px",
});
