import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function BlockedUsersCard() {
  const friendsApi = (api as any).friends;
  const blockedUsers = useQuery(friendsApi.getBlockedUsers);
  const unblockUser = useMutation(friendsApi.unblockUser);
  const blockUserMut = useMutation(friendsApi.blockUser);

  const [blockHandleInput, setBlockHandleInput] = useState("");
  const [blockError, setBlockError] = useState("");
  const [blockSuccess, setBlockSuccess] = useState("");

  const searchProfile = useQuery(
    friendsApi.searchProfile,
    blockHandleInput.trim().length > 0 ? { query: blockHandleInput } : "skip"
  );

  const handleBlockUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockError("");
    setBlockSuccess("");

    const targetHandle = blockHandleInput.trim().toLowerCase();
    if (!targetHandle) return;

    const formatted = targetHandle.startsWith("@") ? targetHandle : "@" + targetHandle;

    try {
      const match = searchProfile?.find((u: any) => u.username === formatted);
      if (!match) {
        setBlockError("User not found with this handle.");
        return;
      }

      await blockUserMut({ blockedUserId: match.userId });
      setBlockSuccess(`Successfully blocked ${formatted}`);
      setBlockHandleInput("");
      setTimeout(() => setBlockSuccess(""), 3000);
    } catch (err: any) {
      setBlockError(err.message || "Failed to block user.");
    }
  };

  const handleUnblock = async (blockedUserId: string) => {
    try {
      await unblockUser({ blockedUserId });
    } catch (err: any) {
      alert("Failed to unblock: " + err.message);
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: 12 }}>🚫 Blocked Users</h3>
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 20 }}>
        Blocked users cannot search for you, see your leaderboard stats, view your exams, or send you messages.
      </p>

      <form onSubmit={handleBlockUser} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Block user by @username..."
          value={blockHandleInput}
          onChange={(e) => setBlockHandleInput(e.target.value)}
          aria-label="Block user by username"
          style={{ flex: 1 }}
          required
        />
        <button type="submit" className="btn btn-danger">Block User</button>
      </form>

      {blockError && <div className="error-msg" style={{ fontSize: "0.8rem", marginBottom: 12 }}>{blockError}</div>}
      {blockSuccess && <div style={{ color: "var(--success)", fontSize: "0.8rem", fontWeight: 500, marginBottom: 12 }}>{blockSuccess}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h4 style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: 4 }}>Blocked List</h4>
        {blockedUsers && blockedUsers.length > 0 ? (
          blockedUsers.map((user: any) => (
            <div
              key={user.userId}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "var(--bg-glass)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user.username}</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleUnblock(user.userId)}
              >
                Unblock
              </button>
            </div>
          ))
        ) : (
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "8px 0" }}>
            No blocked users.
          </div>
        )}
      </div>
    </div>
  );
}
