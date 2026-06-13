import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];
		return await ctx.db
			.query("subjects")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
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
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");
		return await ctx.db.insert("subjects", {
			userId,
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
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");
		const subject = await ctx.db.get(args.id);
		if (!subject || subject.userId !== userId) {
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
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");
		const subject = await ctx.db.get(args.id);
		if (!subject || subject.userId !== userId) {
			throw new Error("Unauthorized");
		}

		// 1. Delete all exams tied to this subject for this user
		const examsToDelete = await ctx.db
			.query("exams")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.collect();
		await Promise.all(
			// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
			examsToDelete.reduce<Promise<any>[]>((acc, exam) => {
				if (exam.subjectId === args.id) {
					acc.push(ctx.db.delete(exam._id));
				}
				return acc;
			}, []),
		);

		// 2. Unset subjectId for tasks
		const tasksToUpdate = await ctx.db
			.query("tasks")
			.withIndex("by_userId_and_subjectId", (q) =>
				q.eq("userId", userId).eq("subjectId", args.id),
			)
			.collect();
		await Promise.all(
			tasksToUpdate.map((task) =>
				ctx.db.patch(task._id, { subjectId: undefined }),
			),
		);

		// 3. Unset subjectId for events
		const eventsToUpdate = await ctx.db
			.query("events")
			.withIndex("by_userId_and_subjectId", (q) =>
				q.eq("userId", userId).eq("subjectId", args.id),
			)
			.collect();
		await Promise.all(
			eventsToUpdate.map((ev) =>
				ctx.db.patch(ev._id, { subjectId: undefined }),
			),
		);

		// 4. Unset subjectId for dailyLogs
		const logsToUpdate = await ctx.db
			.query("dailyLogs")
			.withIndex("by_userId_and_subjectId", (q) =>
				q.eq("userId", userId).eq("subjectId", args.id),
			)
			.collect();
		await Promise.all(
			logsToUpdate.map((log) =>
				ctx.db.patch(log._id, { subjectId: undefined }),
			),
		);

		// Finally delete the subject itself
		await ctx.db.delete(args.id);
	},
});
