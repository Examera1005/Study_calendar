import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useLanguage } from "../../hooks/useLanguage";

export function BlockedUsersCard() {
  const friendsApi = (api as any).friends;
  const blockedUsers = useQuery(friendsApi.getBlockedUsers);
  const unblockUser = useMutation(friendsApi.unblockUser);
  const blockUserMut = useMutation(friendsApi.blockUser);
  const { t, language } = useLanguage();

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
        setBlockError(t.settings.blockedUsersUserNotFound);
        return;
      }

      await blockUserMut({ blockedUserId: match.userId });
      setBlockSuccess(t.settings.blockedUsersBlockSuccess(formatted));
      setBlockHandleInput("");
      setTimeout(() => setBlockSuccess(""), 3000);
    } catch (err: any) {
      setBlockError(err.message || t.settings.blockedUsersBlockFailed);
    }
  };

  const handleUnblock = async (blockedUserId: string) => {
    try {
      await unblockUser({ blockedUserId });
    } catch (err: any) {
      alert(t.settings.blockedUsersUnblockFailed + err.message);
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: 12 }}>{t.settings.blockedUsersTitle}</h3>
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 20 }}>
        {t.settings.blockedUsersDesc}
      </p>

      <form onSubmit={handleBlockUser} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          type="text"
          placeholder={t.settings.blockedUsersSearchPlaceholder}
          value={blockHandleInput}
          onChange={(e) => setBlockHandleInput(e.target.value)}
          aria-label="Block user by username"
          style={{ flex: 1 }}
          required
        />
        <button type="submit" className="btn btn-danger">{t.friends.blockUserBtn}</button>
      </form>

      {blockError && <div className="error-msg" style={{ fontSize: "0.8rem", marginBottom: 12 }}>{blockError}</div>}
      {blockSuccess && <div style={{ color: "var(--success)", fontSize: "0.8rem", fontWeight: 500, marginBottom: 12 }}>{blockSuccess}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h4 style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: 4 }}>
          {t.settings.blockedUsersListTitle}
        </h4>
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
                {t.friends.unblockUserBtn}
              </button>
            </div>
          ))
        ) : (
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "8px 0" }}>
            {t.friends.noBlockedUsers}
          </div>
        )}
      </div>
    </div>
  );
}
