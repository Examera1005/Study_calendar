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
    await ctx.db.delete(args.id);
  },
});
