// The twelve properties of the event, in teaching order.
//
// This lives in its own module with no Astro imports on purpose. It is data,
// not schema: src/content.config.ts imports it to build the enum, and
// spec/course-coherence.test.ts imports it to assert that all twelve are used
// exactly once. Leaving it inside content.config.ts made it unreachable from a
// test, because that file imports "astro:content", which only resolves inside
// an Astro build.
//
// One list, two consumers, no second copy to drift.
export const COURSE_PROPERTIES = [
  "visibility",
  "definition",
  "correlation",
  "spatial-extent",
  "depth",
  "complementarity",
  "duration",
  "reserve-economics",
  "allocation",
  "lead-time",
  "attribution",
  "declared-boundary",
] as const;

export type CourseProperty = (typeof COURSE_PROPERTIES)[number];
