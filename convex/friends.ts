import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper to check if two users have blocked each other
async function hasBlock(ctx: any, user1: string, user2: string) {
  const [b1, b2] = await Promise.all([
    ctx.db
      .query("blocks")
      .withIndex("by_userId_and_blockedUserId", (q: any) =>
        q.eq("userId", user1).eq("blockedUserId", user2)
      )
      .first(),
    ctx.db
      .query("blocks")
      .withIndex("by_userId_and_blockedUserId", (q: any) =>
        q.eq("userId", user2).eq("blockedUserId", user1)
      )
      .first()
  ]);
  return !!(b1 || b2);
}

// Helper to assert two users are accepted friends
async function assertIsFriends(ctx: any, user1: string, user2: string) {
  if (user1 === user2) return true;
  if (await hasBlock(ctx, user1, user2)) {
    throw new Error("Blocked.");
  }
  const [friendship, friendshipReverse] = await Promise.all([
    ctx.db
      .query("friendships")
      .withIndex("by_user1_and_user2", (q: any) =>
        q.eq("user1", user1).eq("user2", user2)
      )
      .first(),
    ctx.db
      .query("friendships")
      .withIndex("by_user1_and_user2", (q: any) =>
        q.eq("user1", user2).eq("user2", user1)
      )
      .first()
  ]);

  const f = friendship || friendshipReverse;
  if (!f || f.status !== "accepted") {
    throw new Error("You must be accepted friends to access this data.");
  }
}

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const createOrUpdateProfile = mutation({
  args: {
    username: v.string(),
    publicKey: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Clean username format (e.g. "@alice")
    let raw = args.username.trim().toLowerCase();
    if (!raw.startsWith("@")) {
      raw = "@" + raw;
    }
    const cleanUsername = raw.replace(/[^a-z0-9_@]/g, "");
    if (cleanUsername.length < 3) {
      throw new Error("Username must be at least 3 characters long.");
    }

    // Check uniqueness
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", cleanUsername))
      .unique();
    
    if (existing && existing.userId !== userId) {
      throw new Error("Username is already taken.");
    }

    const currentProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (currentProfile) {
      await ctx.db.patch(currentProfile._id, {
        username: cleanUsername,
        publicKey: args.publicKey,
      });
      return currentProfile._id;
    } else {
      return await ctx.db.insert("userProfiles", {
        userId,
        username: cleanUsername,
        publicKey: args.publicKey,
      });
    }
  },
});

export const searchProfile = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    let search = args.query.trim().toLowerCase();
    if (search.length === 0) return [];
    if (!search.startsWith("@")) {
      search = "@" + search;
    }

    const matches = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) =>
        q.gte("username", search).lte("username", search + "\uffff")
      )
      .take(50);

    const results = [];
    const blockChecks = await Promise.all(
      matches.map((p) => (p.userId === userId ? Promise.resolve(true) : hasBlock(ctx, userId, p.userId)))
    );
    for (let i = 0; i < matches.length; i++) {
      if (!blockChecks[i]) {
        results.push(matches[i]);
      }
    }
    return results;
  },
});

export const sendFriendRequest = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let targetUsername = args.username.trim().toLowerCase();
    if (!targetUsername.startsWith("@")) {
      targetUsername = "@" + targetUsername;
    }

    const targetProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", targetUsername))
      .unique();

    if (!targetProfile) {
      throw new Error("User not found.");
    }

    if (targetProfile.userId === userId) {
      throw new Error("You cannot add yourself.");
    }

    // Check if blocked
    if (await hasBlock(ctx, userId, targetProfile.userId)) {
      throw new Error("Cannot send friend request: user is blocked.");
    }

    // Check if friendship already exists
    const [friendship, friendshipReverse] = await Promise.all([
      ctx.db
        .query("friendships")
        .withIndex("by_user1_and_user2", (q) =>
          q.eq("user1", userId).eq("user2", targetProfile.userId)
        )
        .first(),
      ctx.db
        .query("friendships")
        .withIndex("by_user1_and_user2", (q) =>
          q.eq("user1", targetProfile.userId).eq("user2", userId)
        )
        .first()
    ]);

    if (friendship || friendshipReverse) {
      throw new Error("Friend request is already pending or accepted.");
    }

    return await ctx.db.insert("friendships", {
      user1: userId,
      user2: targetProfile.userId,
      status: "pending",
      senderId: userId,
    });
  },
});

export const getFriendships = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { accepted: [], pendingReceived: [], pendingSent: [] };

    const [f1, f2] = await Promise.all([
      ctx.db
        .query("friendships")
        .withIndex("by_user1", (q) => q.eq("user1", userId))
        .collect(),
      ctx.db
        .query("friendships")
        .withIndex("by_user2", (q) => q.eq("user2", userId))
        .collect()
    ]);

    const allFriendships = [...f1, ...f2];

    const accepted: any[] = [];
    const pendingReceived: any[] = [];
    const pendingSent: any[] = [];

    const items = await Promise.all(
      allFriendships.map(async (f) => {
        const otherUserId = f.user1 === userId ? f.user2 : f.user1;
        const [blocked, otherProfile] = await Promise.all([
          hasBlock(ctx, userId, otherUserId),
          ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", otherUserId))
            .unique()
        ]);
        if (blocked || !otherProfile) return null;

        let unreadCount = 0;
        if (f.status === "accepted") {
          const receivedMessages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) =>
              q.eq("senderId", otherUserId).eq("receiverId", userId)
            )
            .collect();
          unreadCount = receivedMessages.filter((m) => !m.read).length;
        }

        return {
          friendshipId: f._id,
          userId: otherUserId,
          username: otherProfile.username,
          publicKey: otherProfile.publicKey,
          status: f.status,
          senderId: f.senderId,
          unreadCount,
        };
      })
    );

    for (const item of items) {
      if (!item) continue;
      const { friendshipId, userId: uid, username, publicKey, status, senderId, unreadCount } = item;
      const formatted = { friendshipId, userId: uid, username, publicKey, unreadCount };
      if (status === "accepted") {
        accepted.push(formatted);
      } else if (senderId === userId) {
        pendingSent.push(formatted);
      } else {
        pendingReceived.push(formatted);
      }
    }

    return { accepted, pendingReceived, pendingSent };
  },
});

export const respondToFriendRequest = mutation({
  args: {
    friendshipId: v.id("friendships"),
    action: v.union(v.literal("accept"), v.literal("reject")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const friendship = await ctx.db.get(args.friendshipId);
    if (!friendship) throw new Error("Friend request not found.");

    if (
      friendship.user1 !== userId &&
      friendship.user2 !== userId
    ) {
      throw new Error("Unauthorized");
    }

    // Only the RECIPIENT can accept; the sender may only reject/cancel.
    if (args.action === "accept" && friendship.senderId === userId) {
      throw new Error("You cannot accept your own friend request.");
    }

    if (args.action === "reject") {
      await ctx.db.delete(args.friendshipId);
      return "rejected";
    }

    await ctx.db.patch(args.friendshipId, { status: "accepted" });
    return "accepted";
  },
});

// Leaderboard: rankings of study times (past 7 days) and what they did
export const getFriendsLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get all friends
    const [f1, f2] = await Promise.all([
      ctx.db
        .query("friendships")
        .withIndex("by_user1", (q) => q.eq("user1", userId))
        .collect(),
      ctx.db
        .query("friendships")
        .withIndex("by_user2", (q) => q.eq("user2", userId))
        .collect()
    ]);

    const acceptedFriendCandidates = [...f1, ...f2].reduce<string[]>((acc, f) => {
      if (f.status === "accepted") {
        acc.push(f.user1 === userId ? f.user2 : f.user1);
      }
      return acc;
    }, []);

    // Filter out any blocked users (defense-in-depth)
    const blockChecks = await Promise.all(
      acceptedFriendCandidates.map((friendId) => hasBlock(ctx, userId, friendId))
    );
    const acceptedFriends = acceptedFriendCandidates.filter((_, idx) => !blockChecks[idx]);

    // Include self
    const userIds = [userId, ...acceptedFriends];

    const today = new Date();
    const last7Days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      last7Days.push(d.toISOString().split("T")[0]);
    }
    const minDate = last7Days[last7Days.length - 1];

    const leaderboard: any[] = [];

    const userDetails = await Promise.all(
      userIds.map(async (uid) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", uid))
          .unique();

        if (!profile) return null;

        // Query study logs in the past 7 days
        const logs = await ctx.db
          .query("dailyLogs")
          .withIndex("by_userId_and_date", (q) =>
            q.eq("userId", uid).gte("date", minDate)
          )
          .collect();

        let totalDuration = 0;
        const subjectsStudiedMap = new Map<string, number>();

        for (const log of logs) {
          if (log.duration) {
            totalDuration += log.duration;
            if (log.subjectId) {
              subjectsStudiedMap.set(
                log.subjectId,
                (subjectsStudiedMap.get(log.subjectId) || 0) + log.duration
              );
            }
          }
        }

        // Convert subject durations to details
        const subjectDetailsRaw = await Promise.all(
          Array.from(subjectsStudiedMap.entries()).map(async ([subId, dur]) => {
            const sub = await ctx.db.get(subId as Id<"subjects">);
            if (sub) {
              return {
                name: sub.name,
                icon: sub.icon,
                color: sub.color,
                duration: dur,
              };
            }
            return null;
          })
        );
        const subjectDetails = subjectDetailsRaw.filter(Boolean);

        // Query exams for this user to show "what exams they are preparing for"
        const exams = await ctx.db
          .query("exams")
          .withIndex("by_userId", (q) => q.eq("userId", uid))
          .collect();

        const upcomingExams = exams.reduce<{ title: string; date: string }[]>((acc, e) => {
          if (!e.completed && acc.length < 3) {
            acc.push({ title: e.title, date: e.date });
          }
          return acc;
        }, []);

        return {
          userId: uid,
          username: profile.username,
          totalDuration,
          subjectsStudied: subjectDetails,
          upcomingExams,
        };
      })
    );

    for (const d of userDetails) {
      if (d) leaderboard.push(d);
    }

    // Sort descending by total study minutes
    return leaderboard.sort((a, b) => b.totalDuration - a.totalDuration);
  },
});

// Get friend exams to view and copy
export const getFriendExams = query({
  args: { friendUserId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    await assertIsFriends(ctx, userId, args.friendUserId);

    const exams = await ctx.db
      .query("exams")
      .withIndex("by_userId", (q) => q.eq("userId", args.friendUserId))
      .collect();

    // Map subject details
    const result = await Promise.all(
      exams.map(async (exam) => {
        const subject = await ctx.db.get(exam.subjectId);
        return {
          ...exam,
          subjectName: subject?.name || "Unknown",
          subjectIcon: subject?.icon || "📚",
          subjectColor: subject?.color || "#94a3b8",
        };
      })
    );

    return result;
  },
});

// Import an exam from a friend
export const importFriendExam = mutation({
  args: { examId: v.id("exams") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const sourceExam = await ctx.db.get(args.examId);
    if (!sourceExam) throw new Error("Exam not found.");

    await assertIsFriends(ctx, userId, sourceExam.userId);

    // Find if the user has a subject with the same name.
    // If not, we create one, or we link to their existing subject.
    const sourceSubject = await ctx.db.get(sourceExam.subjectId);
    if (!sourceSubject) throw new Error("Exam subject not found.");

    let targetSubjectId: Id<"subjects">;
    const existingSubject = await ctx.db
      .query("subjects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const match = existingSubject.find((s) => s.name.toLowerCase() === sourceSubject.name.toLowerCase());

    if (match) {
      targetSubjectId = match._id;
    } else {
      // Create clone of subject for current user
      targetSubjectId = await ctx.db.insert("subjects", {
        userId,
        name: sourceSubject.name,
        color: sourceSubject.color,
        icon: sourceSubject.icon,
      });
    }

    // Create the exam clone
    return await ctx.db.insert("exams", {
      userId,
      subjectId: targetSubjectId,
      title: sourceExam.title,
      date: sourceExam.date,
      coefficient: sourceExam.coefficient,
      notes: sourceExam.notes ? `Imported from friend. Original notes: ${sourceExam.notes}` : "Imported from friend.",
      completed: false,
    });
  },
});

// Get E2EE messages between current user and friend
export const getMessages = query({
  args: { friendUserId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    await assertIsFriends(ctx, userId, args.friendUserId);

    // Messages where A sent to B and B sent to A in parallel
    const [sent, received] = await Promise.all([
      ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("senderId", userId).eq("receiverId", args.friendUserId)
        )
        .collect(),
      ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("senderId", args.friendUserId).eq("receiverId", userId)
        )
        .collect()
    ]);

    return [...sent, ...received].sort((a, b) => a.timestamp - b.timestamp);
  },
});

// Send E2EE message
export const sendMessage = mutation({
  args: {
    receiverId: v.string(),
    encryptedBody: v.string(),
    senderEncryptedBody: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await assertIsFriends(ctx, userId, args.receiverId);

    return await ctx.db.insert("messages", {
      senderId: userId,
      receiverId: args.receiverId,
      encryptedBody: args.encryptedBody,
      senderEncryptedBody: args.senderEncryptedBody,
      timestamp: Date.now(),
      read: false,
    });
  },
});

export const checkUsernameAvailable = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    let search = args.username.trim().toLowerCase();
    if (!search.startsWith("@")) {
      search = "@" + search;
    }
    const cleanUsername = search.replace(/[^a-z0-9_@]/g, "");
    if (cleanUsername.length < 3) return false;

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", cleanUsername))
      .unique();

    if (!existing) return true;
    return existing.userId === userId;
  },
});

export const blockUser = mutation({
  args: { blockedUserId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (userId === args.blockedUserId) {
      throw new Error("Cannot block yourself");
    }

    // Check if already blocked
    const existing = await ctx.db
      .query("blocks")
      .withIndex("by_userId_and_blockedUserId", (q) =>
        q.eq("userId", userId).eq("blockedUserId", args.blockedUserId)
      )
      .first();

    if (!existing) {
      await ctx.db.insert("blocks", {
        userId,
        blockedUserId: args.blockedUserId,
      });
    }

    // Delete friendships if they exist
    const f1 = await ctx.db
      .query("friendships")
      .withIndex("by_user1_and_user2", (q) =>
        q.eq("user1", userId).eq("user2", args.blockedUserId)
      )
      .first();
    if (f1) await ctx.db.delete(f1._id);

    const f2 = await ctx.db
      .query("friendships")
      .withIndex("by_user1_and_user2", (q) =>
        q.eq("user1", args.blockedUserId).eq("user2", userId)
      )
      .first();
    if (f2) await ctx.db.delete(f2._id);

    return true;
  },
});

export const unblockUser = mutation({
  args: { blockedUserId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const block = await ctx.db
      .query("blocks")
      .withIndex("by_userId_and_blockedUserId", (q) =>
        q.eq("userId", userId).eq("blockedUserId", args.blockedUserId)
      )
      .first();

    if (block) {
      await ctx.db.delete(block._id);
    }
    return true;
  },
});

export const getBlockedUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const blocks = await ctx.db
      .query("blocks")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const profiles = await Promise.all(
      blocks.map((b) =>
        ctx.db
          .query("userProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", b.blockedUserId))
          .unique()
      )
    );
    const results = profiles.reduce<{ userId: string; username: string }[]>((acc, p) => {
      if (p) {
        acc.push({
          userId: p.userId,
          username: p.username,
        });
      }
      return acc;
    }, []);
    return results;
  },
});

export const getUserEmail = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    return user?.email ?? null;
  },
});

export const markMessagesAsRead = mutation({
  args: { friendUserId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await assertIsFriends(ctx, userId, args.friendUserId);

    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("senderId", args.friendUserId).eq("receiverId", userId)
      )
      .collect();

    for (const msg of unreadMessages) {
      if (!msg.read) {
        await ctx.db.patch(msg._id, { read: true });
      }
    }
    return true;
  },
});

export const deleteOldMessages = internalMutation({
  args: {},
  handler: async (ctx) => {
    const seventyTwoHoursAgo = Date.now() - 72 * 60 * 60 * 1000;

    const oldMessages = await ctx.db
      .query("messages")
      .withIndex("by_timestamp", (q) => q.lt("timestamp", seventyTwoHoursAgo))
      .take(100);

    for (const msg of oldMessages) {
      await ctx.db.delete(msg._id);
    }

    if (oldMessages.length === 100) {
      await ctx.scheduler.runAfter(0, internal.friends.deleteOldMessages, {});
    }
    return true;
  },
});
