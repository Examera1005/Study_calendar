import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Subjects/courses with color coding
  subjects: defineTable({
    userId: v.string(),
    name: v.string(),
    color: v.string(),
    icon: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  // Exams with dates and coefficients
  exams: defineTable({
    userId: v.string(),
    subjectId: v.id("subjects"),
    title: v.string(),
    date: v.string(),
    coefficient: v.number(),
    notes: v.optional(v.string()),
    completed: v.boolean(),
    grade: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_date", ["userId", "date"])
    .index("by_subjectId", ["subjectId"]),

  // Daily study log entries
  dailyLogs: defineTable({
    userId: v.string(),
    date: v.string(),
    subjectId: v.optional(v.id("subjects")),
    content: v.string(),
    duration: v.optional(v.number()),
  }).index("by_userId_and_date", ["userId", "date"]),

  // Tasks (to-do items)
  tasks: defineTable({
    userId: v.string(),
    date: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
    ),
    subjectId: v.optional(v.id("subjects")),
  })
    .index("by_userId_and_date", ["userId", "date"])
    .index("by_userId", ["userId"]),

  // Events (time-blocked calendar events)
  events: defineTable({
    userId: v.string(),
    date: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    subjectId: v.optional(v.id("subjects")),
  }).index("by_userId_and_date", ["userId", "date"]),
});
