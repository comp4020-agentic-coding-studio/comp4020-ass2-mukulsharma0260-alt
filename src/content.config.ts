import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { courseNodeSchema } from "astro-course-university/schemas";

const weekSchema = z.coerce.number().int().min(1).max(12);
const courseNodeLoader = (dir: string) =>
  glob({ pattern: ["**/*.{md,mdx}", "!**/CLAUDE.md"], base: `src/content/${dir}` });
const teacherRefs = z.array(reference("people")).min(1);

const weightedMarking = z
  .object({
    mode: z.literal("weighted"),
    criteria: z
      .array(z.object({ name: z.string().trim().min(1), weight: z.number().positive() }))
      .min(1),
  })
  .superRefine((marking, ctx) => {
    const total = marking.criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
    if (total !== 100) {
      ctx.addIssue({
        code: "custom",
        path: ["criteria"],
        message: `criterion weights sum to ${total}, not 100`,
      });
    }
  });

const holisticMarking = z.object({
  mode: z.literal("holistic"),
  description: z.string().trim().min(40),
});

// Course-specific fields. SLOP6246 holds every teaching week to the same
// contract (CLAUDE.md §3): one property of the event, a claim, a stance
// towards the central thesis, and how the week earns it.
//
// The twelve properties are a locked vocabulary, listed in teaching order, so
// a week cannot invent one. The schema still validates each week in isolation:
// it cannot express "no two weeks share a property", because that is a
// property of the set rather than of one entry, and nothing in the repo
// enforces it automatically at present.
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
  "boundary",
  "declared-boundary",
] as const;

const propertySchema = z.enum(COURSE_PROPERTIES);
const stanceSchema = z.enum(["advances", "complicates", "challenges"]);

export const collections = {
  sessions: defineCollection({
    loader: courseNodeLoader("sessions"),
    schema: courseNodeSchema
      .extend({
        week: weekSchema,
        date: z.coerce.date(),
        teachers: teacherRefs.optional(),
        property: propertySchema,
        stance: stanceSchema,
        claim: z.string().trim().min(1),
        how: z.string().trim().min(1),
        activity: z.string().trim().min(1),
      })
      .loose(),
  }),

  assessments: defineCollection({
    loader: courseNodeLoader("assessments"),
    schema: courseNodeSchema
      .extend({
        week: weekSchema,
        due: z.coerce.date(),
        weight: z.coerce.number().positive().max(100),
        marking: z.discriminatedUnion("mode", [weightedMarking, holisticMarking]).optional(),
        // The ladder is a dependency chain, so each rung records what it
        // consumes and what it hands on (CLAUDE.md §5). `takesInput` is
        // nullable because A1 is the first rung and genuinely has no prior
        // input — a non-null floor here would force one to be invented.
        stage: z.coerce.number().int().min(1).max(4),
        coversWeeks: z.string().trim().min(1),
        takesInput: z.string().trim().min(1).nullable(),
        produces: z.string().trim().min(1),
      })
      .loose(),
  }),

  lectures: defineCollection({
    loader: courseNodeLoader("lectures"),
    schema: courseNodeSchema
      .extend({
        week: weekSchema,
        date: z.coerce.date(),
        teachers: teacherRefs.optional(),
        slides: z
          .string()
          .regex(/^\/decks\/[a-z0-9-]+\/$/)
          .optional(),
      })
      .loose(),
  }),

  people: defineCollection({
    loader: courseNodeLoader("people"),
    schema: ({ image }) =>
      z
        .object({
          title: z.string().trim().min(1),
          description: z.string().trim().min(40),
          role: z.string().trim().min(1),
          contact: z.string().trim().min(1).optional(),
          affiliation: z.string().trim().min(1).optional(),
          email: z.email().optional(),
          url: z.url().optional(),
          photo: image().optional(),
          photoAlt: z.string().trim().optional(),
          published: z.coerce.boolean().default(true),
        })
        .superRefine((person, ctx) => {
          if (person.photo && !person.photoAlt) {
            ctx.addIssue({
              code: "custom",
              path: ["photoAlt"],
              message: "describe the photo when one is supplied",
            });
          }
        }),
  }),
};
