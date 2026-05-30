import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("subjects")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .take(100);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("subjects", {
      userId: identity.tokenIdentifier,
      name: args.name,
      color: args.color,
      icon: args.icon,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("subjects"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const subject = await ctx.db.get(args.id);
    if (!subject || subject.userId !== identity.tokenIdentifier) {
      throw new Error("Unauthorized");
    }
    const updates: Record<string, string> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.color !== undefined) updates.color = args.color;
    if (args.icon !== undefined) updates.icon = args.icon;
    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("subjects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const subject = await ctx.db.get(args.id);
    if (!subject || subject.userId !== identity.tokenIdentifier) {
      throw new Error("Unauthorized");
    }

    // 1. Delete all exams tied to this subject (since subjectId is required)
    const examsToDelete = await ctx.db
      .query("exams")
      .withIndex("by_subjectId", (q) => q.eq("subjectId", args.id))
      .collect();
    for (const exam of examsToDelete) {
      await ctx.db.delete(exam._id);
    }

    // 2. Unset subjectId for tasks
    const tasksToUpdate = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .filter((q) => q.eq(q.field("subjectId"), args.id))
      .collect();
    for (const task of tasksToUpdate) {
      await ctx.db.patch(task._id, { subjectId: undefined });
    }

    // 3. Unset subjectId for events
    const eventsToUpdate = await ctx.db
      .query("events")
      .withIndex("by_userId_and_date", (q) => q.eq("userId", identity.tokenIdentifier))
      .filter((q) => q.eq(q.field("subjectId"), args.id))
      .collect();
    for (const ev of eventsToUpdate) {
      await ctx.db.patch(ev._id, { subjectId: undefined });
    }

    // 4. Unset subjectId for dailyLogs
    const logsToUpdate = await ctx.db
      .query("dailyLogs")
      .withIndex("by_userId_and_date", (q) => q.eq("userId", identity.tokenIdentifier))
      .filter((q) => q.eq(q.field("subjectId"), args.id))
      .collect();
    for (const log of logsToUpdate) {
      await ctx.db.patch(log._id, { subjectId: undefined });
    }

    // Finally delete the subject itself
    await ctx.db.delete(args.id);
  },
});
