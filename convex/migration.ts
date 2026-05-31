import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * One-time migration to convert old userId format (tokenIdentifier)
 * to the stable userId format used by getAuthUserId().
 *
 * Old format: "<issuerURL>|<userId>|<sessionId>"
 * New format: "<userId>" (the raw Convex users table document ID)
 *
 * Run this from the Convex dashboard after deploying the updated code.
 */
export const migrateUserIds = internalMutation({
  args: {},
  handler: async (ctx) => {
    const TABLES_WITH_USERID = [
      "subjects",
      "exams",
      "dailyLogs",
      "tasks",
      "events",
      "userProfiles",
      "blocks",
    ] as const;

    let totalMigrated = 0;

    for (const tableName of TABLES_WITH_USERID) {
      const docs = await ctx.db.query(tableName).collect();
      for (const doc of docs) {
        const oldUserId = (doc as any).userId as string;
        if (!oldUserId || !oldUserId.includes("|")) continue;

        // Extract the stable userId: second segment in "<issuerURL>|<userId>|<sessionId>"
        const parts = oldUserId.split("|");
        if (parts.length < 2) continue;

        const stableUserId = parts[1];
        await ctx.db.patch(doc._id, { userId: stableUserId } as any);
        totalMigrated++;
      }
    }

    // Migrate friendships (user1, user2, senderId)
    const friendships = await ctx.db.query("friendships").collect();
    for (const f of friendships) {
      const updates: Record<string, string> = {};

      if (f.user1.includes("|")) {
        const parts = f.user1.split("|");
        if (parts.length >= 2) updates.user1 = parts[1];
      }
      if (f.user2.includes("|")) {
        const parts = f.user2.split("|");
        if (parts.length >= 2) updates.user2 = parts[1];
      }
      if (f.senderId.includes("|")) {
        const parts = f.senderId.split("|");
        if (parts.length >= 2) updates.senderId = parts[1];
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(f._id, updates);
        totalMigrated++;
      }
    }

    // Migrate messages (senderId, receiverId)
    const messages = await ctx.db.query("messages").collect();
    for (const m of messages) {
      const updates: Record<string, string> = {};

      if (m.senderId.includes("|")) {
        const parts = m.senderId.split("|");
        if (parts.length >= 2) updates.senderId = parts[1];
      }
      if (m.receiverId.includes("|")) {
        const parts = m.receiverId.split("|");
        if (parts.length >= 2) updates.receiverId = parts[1];
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(m._id, updates);
        totalMigrated++;
      }
    }

    // Migrate blocks (blockedUserId field too)
    const blocks = await ctx.db.query("blocks").collect();
    for (const b of blocks) {
      const updates: Record<string, string> = {};

      if (b.blockedUserId.includes("|")) {
        const parts = b.blockedUserId.split("|");
        if (parts.length >= 2) updates.blockedUserId = parts[1];
      }
      // userId already handled above in TABLES_WITH_USERID

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(b._id, updates);
        totalMigrated++;
      }
    }

    console.log(`Migration complete. Total documents migrated: ${totalMigrated}`);
    return { totalMigrated };
  },
});
