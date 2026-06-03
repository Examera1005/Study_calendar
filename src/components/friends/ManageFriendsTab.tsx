import React from "react";

interface ManageFriendsTabProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  handleSendRequest: (e: React.FormEvent) => void;
  requestError: string;
  requestSuccess: string;
  searchResults: any[] | undefined;
  friendships: any;
  handleRespond: (friendshipId: any, action: "accept" | "reject") => void;
  setViewExamsFriend: (f: any) => void;
  setActiveChatFriend: (f: any) => void;
  setActiveTab: (tab: "leaderboard" | "chat" | "manage") => void;
  handleBlockFriend: (blockedUserId: string, username: string) => void;
}

export function ManageFriendsTab({
  searchQuery,
  setSearchQuery,
  handleSendRequest,
  requestError,
  requestSuccess,
  searchResults,
  friendships,
  handleRespond,
  setViewExamsFriend,
  setActiveChatFriend,
  setActiveTab,
  handleBlockFriend,
}: ManageFriendsTabProps) {
  return (
    <div className="friends-manage-grid">
      {/* Column A: Search & Request */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="card">
          <h3>🔍 Search & Add Friends</h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 16 }}>
            Search for other users by typing their username handle.
          </p>

          <form onSubmit={handleSendRequest} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Search @username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search friends by username"
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
              required
            />
            <button type="submit" className="btn btn-primary">Send Invite</button>
          </form>

          {requestError && <div className="error-msg" style={{ fontSize: "0.8rem" }}>{requestError}</div>}
          {requestSuccess && <div style={{ color: "var(--success)", fontSize: "0.8rem", fontWeight: 500 }}>{requestSuccess}</div>}

          {searchResults && searchResults.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 8 }}>Matching handles:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {searchResults.map((user: any) => (
                  <div
                    key={user.userId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "var(--bg-primary)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{user.username}</span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setSearchQuery(user.username);
                      }}
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pending Invites */}
        <div className="card">
          <h3>✉️ Pending Invites</h3>
          
          <div style={{ marginTop: 12 }}>
            <h4 style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 8 }}>Received Requests</h4>
            {friendships?.pendingReceived && friendships.pendingReceived.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {friendships.pendingReceived.map((req: any) => (
                  <div
                    key={req.friendshipId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "var(--bg-primary)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{req.username}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleRespond(req.friendshipId, "accept")}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleRespond(req.friendshipId, "reject")}
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", padding: 6 }}>
                No incoming requests.
              </div>
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <h4 style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 8 }}>Sent Invites</h4>
            {friendships?.pendingSent && friendships.pendingSent.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {friendships.pendingSent.map((req: any) => (
                  <div
                    key={req.friendshipId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "var(--bg-primary)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span>{req.username}</span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRespond(req.friendshipId, "reject")}
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", padding: 6 }}>
                No sent invites pending.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Column B: Friends List */}
      <div className="card">
        <h3>👥 Accepted Friends</h3>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 20 }}>
          Your friends can compete with you on the leaderboard, send secure chats, and let you import their exam schedules.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {friendships?.accepted && friendships.accepted.length > 0 ? (
            friendships.accepted.map((friend: any) => (
              <div
                key={friend.userId}
                className="friend-row-card"
              >
                <div style={{ minWidth: 150 }}>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{friend.username}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
                    🔒 End-to-End Cryptography Active
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setViewExamsFriend(friend)}
                  >
                    🎯 View Exams
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setActiveChatFriend(friend);
                      setActiveTab("chat");
                    }}
                  >
                    💬 Chat
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleBlockFriend(friend.userId, friend.username)}
                  >
                    🚫 Block
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: 30, color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Your friends list is empty. Share your handle to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
