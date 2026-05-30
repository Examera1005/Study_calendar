import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Helper to assert two users are accepted friends
async function assertIsFriends(ctx: any, user1: string, user2: string) {
  if (user1 === user2) return true;
  const friendship = await ctx.db
    .query("friendships")
    .withIndex("by_user1_and_user2", (q: any) =>
      q.eq("user1", user1).eq("user2", user2)
    )
    .first();
  const friendshipReverse = await ctx.db
    .query("friendships")
    .withIndex("by_user1_and_user2", (q: any) =>
      q.eq("user1", user2).eq("user2", user1)
    )
    .first();

  const f = friendship || friendshipReverse;
  if (!f || f.status !== "accepted") {
    throw new Error("You must be accepted friends to access this data.");
  }
}

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .unique();
  },
});

export const createOrUpdateProfile = mutation({
  args: {
    username: v.string(),
    publicKey: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

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
    
    if (existing && existing.userId !== identity.tokenIdentifier) {
      throw new Error("Username is already taken.");
    }

    const currentProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .unique();

    if (currentProfile) {
      await ctx.db.patch(currentProfile._id, {
        username: cleanUsername,
        publicKey: args.publicKey,
      });
      return currentProfile._id;
    } else {
      return await ctx.db.insert("userProfiles", {
        userId: identity.tokenIdentifier,
        username: cleanUsername,
        publicKey: args.publicKey,
      });
    }
  },
});

export const searchProfile = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    
    let search = args.query.trim().toLowerCase();
    if (search.length === 0) return [];
    if (!search.startsWith("@")) {
      search = "@" + search;
    }

    // Since Convex doesn't have prefix full text queries easily, we query some profiles
    // and filter them. We bound this for performance.
    const all = await ctx.db.query("userProfiles").take(100);
    return all.filter(
      (p) => p.userId !== identity.tokenIdentifier && p.username.includes(search)
    );
  },
});

export const sendFriendRequest = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

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

    if (targetProfile.userId === identity.tokenIdentifier) {
      throw new Error("You cannot add yourself.");
    }

    // Check if friendship already exists
    const friendship = await ctx.db
      .query("friendships")
      .withIndex("by_user1_and_user2", (q) =>
        q.eq("user1", identity.tokenIdentifier).eq("user2", targetProfile.userId)
      )
      .first();

    const friendshipReverse = await ctx.db
      .query("friendships")
      .withIndex("by_user1_and_user2", (q) =>
        q.eq("user1", targetProfile.userId).eq("user2", identity.tokenIdentifier)
      )
      .first();

    if (friendship || friendshipReverse) {
      throw new Error("Friend request is already pending or accepted.");
    }

    return await ctx.db.insert("friendships", {
      user1: identity.tokenIdentifier,
      user2: targetProfile.userId,
      status: "pending",
      senderId: identity.tokenIdentifier,
    });
  },
});

export const getFriendships = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { accepted: [], pendingReceived: [], pendingSent: [] };

    const f1 = await ctx.db
      .query("friendships")
      .withIndex("by_user1", (q) => q.eq("user1", identity.tokenIdentifier))
      .collect();

    const f2 = await ctx.db
      .query("friendships")
      .withIndex("by_user2", (q) => q.eq("user2", identity.tokenIdentifier))
      .collect();

    const allFriendships = [...f1, ...f2];

    const accepted: any[] = [];
    const pendingReceived: any[] = [];
    const pendingSent: any[] = [];

    for (const f of allFriendships) {
      const otherUserId = f.user1 === identity.tokenIdentifier ? f.user2 : f.user1;
      const otherProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", otherUserId))
        .unique();

      if (!otherProfile) continue;

      const item = {
        friendshipId: f._id,
        userId: otherUserId,
        username: otherProfile.username,
        publicKey: otherProfile.publicKey,
      };

      if (f.status === "accepted") {
        accepted.push(item);
      } else if (f.senderId === identity.tokenIdentifier) {
        pendingSent.push(item);
      } else {
        pendingReceived.push(item);
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const friendship = await ctx.db.get(args.friendshipId);
    if (!friendship) throw new Error("Friend request not found.");

    if (
      friendship.user1 !== identity.tokenIdentifier &&
      friendship.user2 !== identity.tokenIdentifier
    ) {
      throw new Error("Unauthorized");
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get all friends
    const f1 = await ctx.db
      .query("friendships")
      .withIndex("by_user1", (q) => q.eq("user1", identity.tokenIdentifier))
      .collect();
    const f2 = await ctx.db
      .query("friendships")
      .withIndex("by_user2", (q) => q.eq("user2", identity.tokenIdentifier))
      .collect();

    const acceptedFriends = [...f1, ...f2]
      .filter((f) => f.status === "accepted")
      .map((f) => (f.user1 === identity.tokenIdentifier ? f.user2 : f.user1));

    // Include self
    const userIds = [identity.tokenIdentifier, ...acceptedFriends];

    const today = new Date();
    const last7Days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      last7Days.push(d.toISOString().split("T")[0]);
    }
    const minDate = last7Days[last7Days.length - 1];

    const leaderboard: any[] = [];

    for (const userId of userIds) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();

      if (!profile) continue;

      // Query study logs in the past 7 days
      const logs = await ctx.db
        .query("dailyLogs")
        .withIndex("by_userId_and_date", (q) =>
          q.eq("userId", userId).gte("date", minDate)
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
      const subjectDetails: any[] = [];
      for (const [subId, dur] of subjectsStudiedMap.entries()) {
        const sub = await ctx.db.get(subId as Id<"subjects">);
        if (sub) {
          subjectDetails.push({
            name: sub.name,
            icon: sub.icon,
            color: sub.color,
            duration: dur,
          });
        }
      }

      // Query exams for this user to show "what exams they are preparing for"
      const exams = await ctx.db
        .query("exams")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect();

      const upcomingExams = exams
        .filter((e) => !e.completed)
        .map((e) => ({
          title: e.title,
          date: e.date,
        }))
        .slice(0, 3); // top 3 upcoming exams

      leaderboard.push({
        userId,
        username: profile.username,
        totalDuration,
        subjectsStudied: subjectDetails,
        upcomingExams,
      });
    }

    // Sort descending by total study minutes
    return leaderboard.sort((a, b) => b.totalDuration - a.totalDuration);
  },
});

// Get friend exams to view and copy
export const getFriendExams = query({
  args: { friendUserId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    await assertIsFriends(ctx, identity.tokenIdentifier, args.friendUserId);

    const exams = await ctx.db
      .query("exams")
      .withIndex("by_userId", (q) => q.eq("userId", args.friendUserId))
      .collect();

    // Map subject details
    const result: any[] = [];
    for (const exam of exams) {
      const subject = await ctx.db.get(exam.subjectId);
      result.push({
        ...exam,
        subjectName: subject?.name || "Unknown",
        subjectIcon: subject?.icon || "📚",
        subjectColor: subject?.color || "#94a3b8",
      });
    }

    return result;
  },
});

// Import an exam from a friend
export const importFriendExam = mutation({
  args: { examId: v.id("exams") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const sourceExam = await ctx.db.get(args.examId);
    if (!sourceExam) throw new Error("Exam not found.");

    await assertIsFriends(ctx, identity.tokenIdentifier, sourceExam.userId);

    // Find if the user has a subject with the same name.
    // If not, we create one, or we link to their existing subject.
    const sourceSubject = await ctx.db.get(sourceExam.subjectId);
    if (!sourceSubject) throw new Error("Exam subject not found.");

    let targetSubjectId: Id<"subjects">;
    const existingSubject = await ctx.db
      .query("subjects")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .collect();

    const match = existingSubject.find((s) => s.name.toLowerCase() === sourceSubject.name.toLowerCase());

    if (match) {
      targetSubjectId = match._id;
    } else {
      // Create clone of subject for current user
      targetSubjectId = await ctx.db.insert("subjects", {
        userId: identity.tokenIdentifier,
        name: sourceSubject.name,
        color: sourceSubject.color,
        icon: sourceSubject.icon,
      });
    }

    // Create the exam clone
    return await ctx.db.insert("exams", {
      userId: identity.tokenIdentifier,
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    await assertIsFriends(ctx, identity.tokenIdentifier, args.friendUserId);

    // Messages where A sent to B
    const sent = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("senderId", identity.tokenIdentifier).eq("receiverId", args.friendUserId)
      )
      .collect();

    // Messages where B sent to A
    const received = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("senderId", args.friendUserId).eq("receiverId", identity.tokenIdentifier)
      )
      .collect();

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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await assertIsFriends(ctx, identity.tokenIdentifier, args.receiverId);

    return await ctx.db.insert("messages", {
      senderId: identity.tokenIdentifier,
      receiverId: args.receiverId,
      encryptedBody: args.encryptedBody,
      senderEncryptedBody: args.senderEncryptedBody,
      timestamp: Date.now(),
    });
  },
});
