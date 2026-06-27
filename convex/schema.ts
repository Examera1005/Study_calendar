import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	...authTables,

	// Subjects/courses with color coding
	subjects: defineTable({
		userId: v.string(),
		name: v.string(),
		color: v.string(),
		icon: v.optional(v.string()),
		archived: v.optional(v.boolean()),
	}).index("by_userId", ["userId"]),

	// Exams with dates and coefficients
	exams: defineTable({
		userId: v.string(),
		subjectId: v.id("subjects"),
		title: v.string(),
		date: v.string(),
		coefficient: v.number(),
		notes: v.optional(v.string()),
		completed: v.boolean(),
		grade: v.optional(v.number()),
	})
		.index("by_userId", ["userId"])
		.index("by_userId_and_date", ["userId", "date"])
		.index("by_subjectId", ["subjectId"]),

	// Daily study log entries
	dailyLogs: defineTable({
		userId: v.string(),
		date: v.string(),
		subjectId: v.optional(v.id("subjects")),
		content: v.string(),
		duration: v.optional(v.number()),
	})
		.index("by_userId_and_date", ["userId", "date"])
		.index("by_userId_and_subjectId", ["userId", "subjectId"]),

	// Tasks (to-do items) — "daily" tasks are tied to a date, "general" are backlog items
	tasks: defineTable({
		userId: v.string(),
		date: v.optional(v.string()),
		title: v.string(),
		description: v.optional(v.string()),
		completed: v.boolean(),
		priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
		subjectId: v.optional(v.id("subjects")),
		taskType: v.optional(v.union(v.literal("daily"), v.literal("general"))),
	})
		.index("by_userId_and_date", ["userId", "date"])
		.index("by_userId", ["userId"])
		.index("by_userId_and_taskType", ["userId", "taskType"])
		.index("by_userId_and_subjectId", ["userId", "subjectId"]),

	// Events (time-blocked calendar events)
	events: defineTable({
		userId: v.string(),
		date: v.string(),
		startTime: v.optional(v.string()),
		endTime: v.optional(v.string()),
		title: v.string(),
		description: v.optional(v.string()),
		color: v.optional(v.string()),
		subjectId: v.optional(v.id("subjects")),
	})
		.index("by_userId_and_date", ["userId", "date"])
		.index("by_userId_and_subjectId", ["userId", "subjectId"]),

	userProfiles: defineTable({
		userId: v.string(),
		username: v.string(),
		publicKey: v.string(),
		// Zero-Knowledge Escrow fields (optional for backward-compatibility)
		userSalt: v.optional(v.string()), // Base64 of 16-byte PBKDF2 salt
		encryptedPrivateKey: v.optional(v.string()), // Base64: iv(12B) || AES-GCM ciphertext of PKCS8 private key
	})
		.index("by_userId", ["userId"])
		.index("by_username", ["username"]),

	friendships: defineTable({
		user1: v.string(), // userId of friend A
		user2: v.string(), // userId of friend B
		status: v.union(v.literal("pending"), v.literal("accepted")),
		senderId: v.string(),
	})
		.index("by_user1", ["user1"])
		.index("by_user2", ["user2"])
		.index("by_user1_and_user2", ["user1", "user2"]),

	messages: defineTable({
		senderId: v.string(),
		receiverId: v.string(),
		encryptedBody: v.string(),
		senderEncryptedBody: v.string(),
		timestamp: v.number(),
		read: v.optional(v.boolean()),
	})
		.index("by_conversation", ["senderId", "receiverId"])
		.index("by_receiverId", ["receiverId"])
		.index("by_timestamp", ["timestamp"]),

	blocks: defineTable({
		userId: v.string(),
		blockedUserId: v.string(),
	})
		.index("by_userId", ["userId"])
		.index("by_userId_and_blockedUserId", ["userId", "blockedUserId"])
		.index("by_blockedUserId", ["blockedUserId"]),

	userSettings: defineTable({
		userId: v.string(),
		theme: v.optional(v.union(v.literal("light"), v.literal("dark"))),
		customizations: v.optional(v.string()), // JSON string of all customizations
	}).index("by_userId", ["userId"]),

	// Rate limits table to track action attempts (e.g., login, password resets)
	rateLimits: defineTable({
		key: v.string(),
		count: v.number(),
		resetTime: v.number(), // Milliseconds timestamp
	}).index("by_key", ["key"]),
});
