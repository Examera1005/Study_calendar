import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("dailyLogs")
      .withIndex("by_userId_and_date", (q) =>
        q.eq("userId", userId).eq("date", args.date),
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.subjectId !== undefined) {
      const subject = await ctx.db.get(args.subjectId);
      if (!subject || subject.userId !== userId) {
        throw new Error("Subject not found or unauthorized");
      }
    }

    return await ctx.db.insert("dailyLogs", {
      userId,
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const log = await ctx.db.get(args.id);
    if (!log || log.userId !== userId) {
      throw new Error("Unauthorized");
    }

    if (args.subjectId !== undefined) {
      const subject = await ctx.db.get(args.subjectId);
      if (!subject || subject.userId !== userId) {
        throw new Error("Subject not found or unauthorized");
      }
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const log = await ctx.db.get(args.id);
    if (!log || log.userId !== userId) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(args.id);
  },
});

export const getByDateRange = query({
  args: { startDate: v.string(), endDate: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("dailyLogs")
      .withIndex("by_userId_and_date", (q) =>
        q
          .eq("userId", userId)
          .gte("date", args.startDate)
          .lte("date", args.endDate),
      )
      .take(500);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("dailyLogs")
      .withIndex("by_userId_and_date", (q) =>
        q.eq("userId", userId)
      )
      .take(500);
  },
});
