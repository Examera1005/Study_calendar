import { v } from "convex/values";
import { internalMutation, type MutationCtx } from "./_generated/server";

/**
 * Checks if a given key has exceeded its rate limit.
 *
 * @param ctx The mutation context
 * @param key The unique identifier key for this rate limit (e.g. "reset_password:user@example.com")
 * @param limit The maximum number of attempts allowed in the window
 * @param windowMs The duration of the window in milliseconds
 * @returns An object indicating if the request is ok, and how many seconds to retry after if limited
 */
export async function checkRateLimit(
	ctx: MutationCtx,
	key: string,
	limit: number,
	windowMs: number,
): Promise<{ ok: boolean; retryAfterSec: number }> {
	const now = Date.now();

	// Find existing rate limit record
	const rateLimit = await ctx.db
		.query("rateLimits")
		.withIndex("by_key", (q) => q.eq("key", key))
		.unique();

	if (!rateLimit || now > rateLimit.resetTime) {
		const newLimit = {
			key,
			count: 1,
			resetTime: now + windowMs,
		};
		if (rateLimit) {
			await ctx.db.replace(rateLimit._id, newLimit);
		} else {
			await ctx.db.insert("rateLimits", newLimit);
		}
		return { ok: true, retryAfterSec: 0 };
	}

	if (rateLimit.count >= limit) {
		const retryAfterSec = Math.ceil((rateLimit.resetTime - now) / 1000);
		return { ok: false, retryAfterSec };
	}

	// Increment the count
	await ctx.db.patch(rateLimit._id, { count: rateLimit.count + 1 });
	return { ok: true, retryAfterSec: 0 };
}

export const checkRateLimitMutation = internalMutation({
	args: {
		key: v.string(),
		limit: v.number(),
		windowMs: v.number(),
	},
	handler: async (ctx, args) => {
		return await checkRateLimit(ctx, args.key, args.limit, args.windowMs);
	},
});
