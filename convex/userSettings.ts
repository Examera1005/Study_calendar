import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return null;
		return await ctx.db
			.query("userSettings")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.unique();
	},
});

export const update = mutation({
	args: {
		theme: v.optional(v.union(v.literal("light"), v.literal("dark"))),
		customizations: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const existing = await ctx.db
			.query("userSettings")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.unique();

		if (existing) {
			const updates: { theme?: "light" | "dark"; customizations?: string } = {};
			if (args.theme !== undefined) {
				updates.theme = args.theme;
			}
			if (args.customizations !== undefined) {
				updates.customizations = args.customizations;
			}
			await ctx.db.patch(existing._id, updates);
			return existing._id;
		} else {
			return await ctx.db.insert("userSettings", {
				userId,
				theme: args.theme ?? "dark",
				customizations: args.customizations ?? "{}",
			});
		}
	},
});
