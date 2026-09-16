import type { CourseMetaInput } from "astro-course-university";
import { z } from "astro/zod";

// The level digits ANU uses: 1000--4000 undergraduate, 6000 and 8000
// postgraduate. Both the code pattern and the level field derive from this.
const LEVELS = [1, 2, 3, 4, 6, 8] as const;
const allowedCode = new RegExp(`^SLOP[${LEVELS.join("")}]\\d{3}$`);

export const slopCourseMetaSchema = z
  .strictObject({
    code: z.string().regex(allowedCode, {
      message: "use SLOP plus a 1000–4000, 6000 or 8000 level code",
    }),
    title: z.string().trim().min(1).max(100),
    session: z.string().trim().min(1).max(40),
    year: z.number().int().min(2026).max(2200),
    level: z.literal(LEVELS),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    description: z.string().trim().min(80).max(300),
    tags: z.array(z.string().trim().min(2).max(24)).min(1).max(3),
  })
  .superRefine((course, ctx) => {
    const codeLevel = Number(course.code.at(4));
    if (course.level !== codeLevel) {
      ctx.addIssue({
        code: "custom",
        path: ["level"],
        message: `must match ${course.code}'s first digit (${codeLevel})`,
      });
    }
    if (course.startDate > course.endDate) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "must not be after endDate",
      });
    }
  });

// The single source of truth for the course record. The generated homepage,
// navigation label and /api/index.json all read this object, so no page
// restates these facts.
//
// The last three digits (246) were allocated to this repo and must not change.
// The leading digit is the ANU level: 6 for postgraduate coursework, which
// `level` mirrors.
export const courseMeta = slopCourseMetaSchema.parse({
  code: "SLOP6246",
  title: "Dunkelflaute: Designing for the Week the Weather Stops",
  session: "Semester 2",
  year: 2026,
  level: 6,
  startDate: "2026-07-27",
  endDate: "2026-10-30",
  description:
    "Twelve weeks on one failure condition: the period when wind and solar " +
    "output are simultaneously low for long enough that normal planning " +
    "assumptions stop holding. A renewable grid is not designed by its " +
    "average — it is designed by the event it must survive.",
  tags: ["energy systems", "reliability", "design"],
}) satisfies CourseMetaInput;

/** The ANU level as readers see it, derived from the code's leading digit rather
 *  than typed. A page that renders this cannot disagree with the code, and
 *  cannot drop a digit the way string concatenation did (`level` + "00" gave
 *  "600" for SLOP6246). spec/course-contract.test.ts asserts the relationship. */
export const courseLevelLabel = String(Number(courseMeta.code.at(4)) * 1000);

/** The course title is one field because the catalogue ingests one field, but
 *  readers need it in two parts. Split on the first colon rather than storing a
 *  second copy, so the name and the subtitle cannot drift apart. */
export const courseName = courseMeta.title.split(": ")[0]!;
export const courseSubtitle = courseMeta.title.slice(courseName.length + 2);
