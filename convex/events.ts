import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByDate = query({
	args: { date: v.string() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];
		return await ctx.db
			.query("events")
			.withIndex("by_userId_and_date", (q) =>
				q.eq("userId", userId).eq("date", args.date),
			)
			.take(50);
	},
});

export const getByDateRange = query({
	args: { startDate: v.string(), endDate: v.string() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];
		return await ctx.db
			.query("events")
			.withIndex("by_userId_and_date", (q) =>
				q
					.eq("userId", userId)
					.gte("date", args.startDate)
					.lte("date", args.endDate),
			)
			.take(200);
	},
});

export const create = mutation({
	args: {
		date: v.string(),
		title: v.string(),
		startTime: v.optional(v.string()),
		endTime: v.optional(v.string()),
		description: v.optional(v.string()),
		color: v.optional(v.string()),
		subjectId: v.optional(v.id("subjects")),
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

		return await ctx.db.insert("events", {
			userId,
			date: args.date,
			title: args.title,
			startTime: args.startTime,
			endTime: args.endTime,
			description: args.description,
			color: args.color,
			subjectId: args.subjectId,
		});
	},
});

export const update = mutation({
	args: {
		id: v.id("events"),
		title: v.optional(v.string()),
		date: v.optional(v.string()),
		startTime: v.optional(v.string()),
		endTime: v.optional(v.string()),
		description: v.optional(v.string()),
		color: v.optional(v.string()),
		subjectId: v.optional(v.id("subjects")),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");
		const event = await ctx.db.get(args.id);
		if (!event || event.userId !== userId) {
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
	args: { id: v.id("events") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");
		const event = await ctx.db.get(args.id);
		if (!event || event.userId !== userId) {
			throw new Error("Unauthorized");
		}
		await ctx.db.delete(args.id);
	},
});
