import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";

export function SettingsView({
  theme,
  setTheme,
}: {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
}) {
  const friendsApi = (api as any).friends;
  const profile = useQuery(friendsApi.getProfile);
  const blockedUsers = useQuery(friendsApi.getBlockedUsers);

  const updateProfile = useMutation(friendsApi.createOrUpdateProfile);
  const unblockUser = useMutation(friendsApi.unblockUser);
  const blockUserByHandle = useMutation(friendsApi.sendFriendRequest); // We will find the user and block them

  // Username form state
  const [usernameInput, setUsernameInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Block by handle state
  const [blockHandleInput, setBlockHandleInput] = useState("");
  const [blockError, setBlockError] = useState("");
  const [blockSuccess, setBlockSuccess] = useState("");

  const searchProfile = useQuery(
    friendsApi.searchProfile,
    blockHandleInput.trim().length > 0 ? { query: blockHandleInput } : "skip"
  );
  const blockUserMut = useMutation(friendsApi.blockUser);

  // Initialize username input when profile loads
  useEffect(() => {
    if (profile) {
      // Remove @ prefix for display in the input box
      setUsernameInput(profile.username.replace("@", ""));
    }
  }, [profile]);

  // Debounced username checking
  useEffect(() => {
    if (!profile) return;
    const cleanInput = usernameInput.trim().toLowerCase();
    const currentClean = profile.username.replace("@", "");

    if (cleanInput === currentClean) {
      setIsAvailable(true);
      setUsernameError("");
      return;
    }

    if (cleanInput.length < 3) {
      setIsAvailable(false);
      setUsernameError("Username must be at least 3 characters.");
      return;
    }

    const hasInvalid = /[^a-z0-9_]/.test(cleanInput);
    if (hasInvalid) {
      setIsAvailable(false);
      setUsernameError("Only letters, numbers, and underscores allowed.");
      return;
    }

    setIsChecking(true);
    setIsAvailable(null);
    setUsernameError("");

    const delay = setTimeout(async () => {
      try {
        // We call the check mutation or query directly
        const formatted = "@" + cleanInput;
        // Since we cast api to any, we can do:
        const available = await (api as any).friends.checkUsernameAvailable({
          username: formatted,
        });
        setIsAvailable(available);
        if (!available) {
          setUsernameError("Handle is already taken.");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsChecking(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [usernameInput, profile]);

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !isAvailable || isChecking) return;

    setIsSaving(true);
    setSaveSuccess("");
    try {
      await updateProfile({
        username: usernameInput,
        publicKey: profile.publicKey,
      });
      setSaveSuccess("Profile handle updated successfully!");
      setTimeout(() => setSaveSuccess(""), 3000);
    } catch (err: any) {
      setUsernameError(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlockUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockError("");
    setBlockSuccess("");

    const targetHandle = blockHandleInput.trim().toLowerCase();
    if (!targetHandle) return;

    const formatted = targetHandle.startsWith("@") ? targetHandle : "@" + targetHandle;

    try {
      // Find user profile with this handle
      // We can search through searchProfile or check if it exists in searchResults
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

  const handleUnblock = async (blockedUserId: string, username: string) => {
    try {
      await unblockUser({ blockedUserId });
    } catch (err: any) {
      alert("Failed to unblock: " + err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Section 1: Appearance */}
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>🎨 Theme & Appearance</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 16 }}>
            Customize your app theme. Preferred theme will be saved automatically.
          </p>

          <div style={{ display: "flex", gap: 16 }}>
            <button
              className={`btn ${theme === "dark" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setTheme("dark")}
              style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
            >
              <span style={{ fontSize: "1.5rem" }}>🌙</span>
              <strong>Dark Mode</strong>
            </button>
            <button
              className={`btn ${theme === "light" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setTheme("light")}
              style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
            >
              <span style={{ fontSize: "1.5rem" }}>☀️</span>
              <strong>Light Mode</strong>
            </button>
          </div>
        </div>

        {/* Section 2: Profile Handle */}
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>👥 Study Guild Handle</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 20 }}>
            Change your unique handle. Other users can find and add you using this.
          </p>

          {!profile ? (
            <div style={{ padding: 12, background: "var(--accent-light)", borderRadius: "var(--radius-md)", color: "var(--accent-primary)", fontSize: "0.85rem" }}>
              Please set up your profile in the Friends tab to configure your handle.
            </div>
          ) : (
            <form onSubmit={handleSaveUsername}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Change @username</label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <span style={{ position: "absolute", left: 12, color: "var(--text-muted)", fontWeight: 600 }}>@</span>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="e.g. math_wizard"
                    style={{ paddingLeft: 28 }}
                    required
                  />
                </div>

                <div style={{ marginTop: 8, fontSize: "0.8rem" }}>
                  {isChecking && <span style={{ color: "var(--text-muted)" }}>Checking availability...</span>}
                  {!isChecking && isAvailable === true && usernameInput.trim().toLowerCase() !== profile.username.replace("@", "") && (
                    <span style={{ color: "var(--success)" }}>✅ Handle is available</span>
                  )}
                  {!isChecking && usernameError && (
                    <span style={{ color: "var(--danger)" }}>❌ {usernameError}</span>
                  )}
                </div>
              </div>

              {saveSuccess && (
                <div style={{ color: "var(--success)", fontSize: "0.85rem", fontWeight: 500, marginBottom: 16 }}>
                  {saveSuccess}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={!isAvailable || isChecking || isSaving || usernameInput.trim().toLowerCase() === profile.username.replace("@", "")}
              >
                {isSaving ? "Saving..." : "Update Handle"}
              </button>
            </form>
          )}
        </div>

        {/* Section 3: Blocking list */}
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
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleUnblock(user.userId, user.username)}
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
      </div>
    </div>
  );
}
