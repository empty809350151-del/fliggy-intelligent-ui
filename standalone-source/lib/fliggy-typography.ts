import { createTheme } from "@openuidev/react-ui";

// Figma 246:149, 2× artboard converted to CSS pixels (confirmed by the user).
const family = '"PingFang SC", "Microsoft YaHei", sans-serif';
const text = (size: number, weight = 400, lineHeight = 1.4) =>
  `${weight} ${size}px/${lineHeight} ${family}`;

export const fliggyTypographyTheme = createTheme({
  fontBody: family, fontHeading: family, fontLabel: family, fontNumbers: family,
  fontSize2xs: "10px", fontSizeXs: "12px", fontSizeSm: "14px",
  fontSizeMd: "15px", fontSizeLg: "18px", fontSizeXl: "21px",
  // Larger sizes are original-project compatibility tiers, not supplied Fliggy tokens.
  fontSize2xl: "24px", fontSize3xl: "28px", fontSize4xl: "32px", fontSize5xl: "36px",
  fontWeightRegular: "400", fontWeightMedium: "500", fontWeightBold: "500", fontWeightHeavy: "500",
  fontVariationRegular: "normal", fontVariationMedium: "normal",
  lineHeightBody: "1.7", lineHeightHeading: "1.4", lineHeightHeadingLarge: "1.4", lineHeightLabel: "1.4",
  letterSpacingNormal: "0", letterSpacingTight: "0", letterSpacingTighter: "0",
  textBodyXs: text(12), textBodyXsHeavy: text(12, 500),
  textBodySm: text(14), textBodySmHeavy: text(14, 500),
  textBodyDefault: text(15, 400, 1.7), textBodyDefaultHeavy: text(15, 500, 1.7),
  textBodyLg: text(18), textBodyLgHeavy: text(18, 500),
  textHeadingXs: text(15, 500), textHeadingSm: text(18, 500),
  textHeadingMd: text(24, 500), textHeadingLg: text(28, 500), textHeadingXl: text(32, 500),
  textLabelXs: text(12), textLabelXsHeavy: text(12, 500),
  textLabelSm: text(14), textLabelSmHeavy: text(14, 500),
  textLabelDefault: text(15), textLabelDefaultHeavy: text(15, 500),
  textLabelLg: text(18), textLabelLgHeavy: text(18, 500),
  textNumbersXs: text(12), textNumbersXsHeavy: text(12, 500),
  textNumbersSm: text(14), textNumbersSmHeavy: text(14, 500),
  textNumbersDefault: text(15), textNumbersDefaultHeavy: text(15, 500),
  textNumbersLg: text(18), textNumbersLgHeavy: text(18, 500),
  textNumbersHeadingSm: text(18, 500), textNumbersHeadingMd: text(24, 500),
  textNumbersHeadingLg: text(28, 500),
  textNumbersHeadingXl: text(32, 500), textNumbersHeadingXlLetterSpacing: "0",
  textBodyXsLetterSpacing: "0", textBodyXsHeavyLetterSpacing: "0",
  textBodySmLetterSpacing: "0", textBodySmHeavyLetterSpacing: "0",
  textBodyDefaultLetterSpacing: "0", textBodyDefaultHeavyLetterSpacing: "0",
  textBodyLgLetterSpacing: "0", textBodyLgHeavyLetterSpacing: "0",
  textHeadingXsLetterSpacing: "0", textHeadingSmLetterSpacing: "0",
  textHeadingMdLetterSpacing: "0", textHeadingLgLetterSpacing: "0", textHeadingXlLetterSpacing: "0",
  textLabelXsLetterSpacing: "0", textLabelXsHeavyLetterSpacing: "0",
  textLabelSmLetterSpacing: "0", textLabelSmHeavyLetterSpacing: "0",
  textLabelDefaultLetterSpacing: "0", textLabelDefaultHeavyLetterSpacing: "0",
  textLabelLgLetterSpacing: "0", textLabelLgHeavyLetterSpacing: "0",
  textNumbersXsLetterSpacing: "0", textNumbersXsHeavyLetterSpacing: "0",
  textNumbersSmLetterSpacing: "0", textNumbersSmHeavyLetterSpacing: "0",
  textNumbersDefaultLetterSpacing: "0", textNumbersDefaultHeavyLetterSpacing: "0",
  textNumbersLgLetterSpacing: "0", textNumbersLgHeavyLetterSpacing: "0",
  textNumbersHeadingSmLetterSpacing: "0", textNumbersHeadingMdLetterSpacing: "0",
  textNumbersHeadingLgLetterSpacing: "0",
});
