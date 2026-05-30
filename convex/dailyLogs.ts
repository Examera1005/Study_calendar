import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("dailyLogs")
      .withIndex("by_userId_and_date", (q) =>
        q.eq("userId", identity.tokenIdentifier).eq("date", args.date),
      )
      .take(50);
  },
});

export const create = mutation({
  args: {
    date: v.string(),
    content: v.string(),
    subjectId: v.optional(v.id("subjects")),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("dailyLogs", {
      userId: identity.tokenIdentifier,
      date: args.date,
      content: args.content,
      subjectId: args.subjectId,
      duration: args.duration,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("dailyLogs"),
    content: v.optional(v.string()),
    subjectId: v.optional(v.id("subjects")),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const log = await ctx.db.get(args.id);
    if (!log || log.userId !== identity.tokenIdentifier) {
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
  args: { id: v.id("dailyLogs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const log = await ctx.db.get(args.id);
    if (!log || log.userId !== identity.tokenIdentifier) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(args.id);
  },
});

export const getByDateRange = query({
  args: { startDate: v.string(), endDate: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("dailyLogs")
      .withIndex("by_userId_and_date", (q) =>
        q
          .eq("userId", identity.tokenIdentifier)
          .gte("date", args.startDate)
          .lte("date", args.endDate),
      )
      .collect();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("dailyLogs")
      .withIndex("by_userId_and_date", (q) =>
        q.eq("userId", identity.tokenIdentifier)
      )
      .collect();
  },
});

