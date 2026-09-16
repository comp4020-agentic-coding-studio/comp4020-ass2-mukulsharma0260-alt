import { defineSiteConfig } from "astro-theme-university/types";
import { slopBranding } from "astro-theme-slop";
import { courseMeta } from "./course-config";

// The collection key and URL stay `sessions`, which the catalogue reads. These
// labels are the language students see. SLOP6246 calls them Weeks: a week is the
// unit a student navigates by, and "studio" is reserved for the two-hour
// session inside one, never used as a synonym for the week itself.
export const sessionLabels = {
  singular: "Week",
  plural: "Weeks",
} as const;

export const graphCollections = ["sessions", "assessments", "lectures", "people"];

export const courseApiCollections = [
  ...graphCollections.map((key) => ({ key })),
  { key: "policies", dir: "pages/policies" },
];

export const siteConfig = defineSiteConfig({
  ...slopBranding,
  name: "Slop University",

  links: [
    { text: "The Event", href: "/the-event/" },
    { text: sessionLabels.plural, href: "/sessions/" },
    { text: "Assessment", href: "/assessments/" },
    { text: "Lectures", href: "/lectures/" },
    { text: "Failure Wall", href: "/failure-wall/" },
    { text: "About", href: "/about/" },
    { text: "Policies", href: "/policies/" },
  ],

  licence: "CC-BY-NC-SA-4.0",
  socialImage: "/src/assets/images/card.png",
  socialImageAlt: `A preview card for ${courseMeta.code}: ${courseMeta.title}`,
});
