import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId_and_date", (q) =>
        q.eq("userId", identity.tokenIdentifier).eq("date", args.date),
      )
      .take(50);
    // Only return daily tasks (or legacy tasks without taskType)
    return tasks.filter((t) => t.taskType !== "general");
  },
});

export const listGeneral = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("tasks")
      .withIndex("by_userId_and_taskType", (q) =>
        q.eq("userId", identity.tokenIdentifier).eq("taskType", "general"),
      )
      .take(100);
  },
});

export const listIncomplete = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .take(100);
    return tasks.filter((t) => !t.completed);
  },
});

export const create = mutation({
  args: {
    date: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
    ),
    subjectId: v.optional(v.id("subjects")),
    taskType: v.optional(v.union(v.literal("daily"), v.literal("general"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const type = args.taskType ?? "daily";
    return await ctx.db.insert("tasks", {
      userId: identity.tokenIdentifier,
      date: type === "general" ? undefined : args.date,
      title: args.title,
      description: args.description,
      completed: false,
      priority: args.priority,
      subjectId: args.subjectId,
      taskType: type,
    });
  },
});

export const toggleComplete = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== identity.tokenIdentifier) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.id, { completed: !task.completed });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    ),
    subjectId: v.optional(v.id("subjects")),
    taskType: v.optional(v.union(v.literal("daily"), v.literal("general"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== identity.tokenIdentifier) {
      throw new Error("Unauthorized");
    }
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined),
    );
    // If switching to general, clear the date
    if (updates.taskType === "general") {
      delete filtered.date;
      await ctx.db.patch(id, { ...filtered, date: undefined });
    } else {
      await ctx.db.patch(id, filtered);
    }
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== identity.tokenIdentifier) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(args.id);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .take(200);
  },
});

