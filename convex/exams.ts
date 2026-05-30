import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("exams")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .take(200);
  },
});

export const upcoming = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const today = new Date().toISOString().split("T")[0];
    const exams = await ctx.db
      .query("exams")
      .withIndex("by_userId_and_date", (q) =>
        q.eq("userId", identity.tokenIdentifier).gte("date", today),
      )
      .take(args.limit ?? 10);
    return exams.filter((e) => !e.completed);
  },
});

export const create = mutation({
  args: {
    subjectId: v.id("subjects"),
    title: v.string(),
    date: v.string(),
    coefficient: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("exams", {
      userId: identity.tokenIdentifier,
      subjectId: args.subjectId,
      title: args.title,
      date: args.date,
      coefficient: args.coefficient,
      notes: args.notes,
      completed: false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("exams"),
    title: v.optional(v.string()),
    date: v.optional(v.string()),
    coefficient: v.optional(v.number()),
    notes: v.optional(v.string()),
    completed: v.optional(v.boolean()),
    grade: v.optional(v.number()),
    subjectId: v.optional(v.id("subjects")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const exam = await ctx.db.get(args.id);
    if (!exam || exam.userId !== identity.tokenIdentifier) {
      throw new Error("Unauthorized");
    }
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined),
    );
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("exams") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const exam = await ctx.db.get(args.id);
    if (!exam || exam.userId !== identity.tokenIdentifier) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(args.id);
  },
});
