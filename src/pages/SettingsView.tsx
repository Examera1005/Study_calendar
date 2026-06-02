import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { ColorPicker } from "../components/ui/ColorPicker";
import {
  loadCustomizations,
  saveCustomizations,
  clearCustomizations,
  applyThemeCustomizations,
} from "../utils/colorUtils";
import { Modal } from "../components/ui/Modal";

export function SettingsView({
  theme,
  setTheme,
}: {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
}) {
  const COLOR_VARIABLES = [
    { key: "--accent-primary", label: "Primary Accent", defaultDark: "#3b82f6", defaultLight: "#2563eb" },
    { key: "--bg-primary", label: "App Background", defaultDark: "#1b1c1d", defaultLight: "#f8fafc" },
    { key: "--bg-secondary", label: "Sidebar & Card Background", defaultDark: "#141b2b", defaultLight: "#ffffff" },
    { key: "--text-primary", label: "Primary Text", defaultDark: "#ffffff", defaultLight: "#0f172a" },
    { key: "--text-secondary", label: "Secondary Text", defaultDark: "#90a9cb", defaultLight: "#475569" },
  ];

  const getPresetsForVariable = (variable: string, themeMode: "light" | "dark") => {
    if (variable === "--accent-primary") {
      return [
        "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
        "#f59e0b", "#10b981", "#14b8a6", "#64748b", "#1b1c1d", "#f8fafc"
      ];
    }
    if (variable.includes("--bg-")) {
      return themeMode === "dark"
        ? ["#1b1c1d", "#141b2b", "#0f172a", "#1e1e2e", "#121212", "#18181b"]
        : ["#f8fafc", "#f9fafb", "#f4f4f5", "#fafaf9", "#f5f5f7", "#ffffff"];
    }
    return themeMode === "dark"
      ? ["#ffffff", "#f8fafc", "#e2e8f0", "#cbd5e1", "#94a3b8", "#90a9cb"]
      : ["#0f172a", "#1e293b", "#334155", "#475569", "#64748b", "#94a3b8"];
  };

  const friendsApi = (api as any).friends;
  const profile = useQuery(friendsApi.getProfile);
  const blockedUsers = useQuery(friendsApi.getBlockedUsers);
  const userEmail = useQuery(friendsApi.getUserEmail);

  // Theme customizations from Convex
  const userSettings = useQuery((api as any).userSettings?.get);
  const updateSettings = useMutation((api as any).userSettings?.update);

  // Theme customizations state
  const [customizations, setCustomizations] = useState<Record<string, string>>(() => loadCustomizations(theme));
  const [activeVariable, setActiveVariable] = useState<string | null>(null);
  const [showLegal, setShowLegal] = useState<"privacy" | "terms" | null>(null);

  useEffect(() => {
    setCustomizations(loadCustomizations(theme));
    setActiveVariable(null);
  }, [theme]);

  // Sync customizations in real-time when they change on another device
  useEffect(() => {
    if (userSettings && userSettings.customizations) {
      try {
        const allConfigs = JSON.parse(userSettings.customizations);
        const activeCustomizations = allConfigs[theme] || {};
        if (JSON.stringify(activeCustomizations) !== JSON.stringify(customizations)) {
          setCustomizations(activeCustomizations);
        }
      } catch (e) {
        console.error("Failed to parse user settings customizations:", e);
      }
    }
  }, [userSettings, theme, customizations]);

  const handleColorChange = (newColor: string) => {
    if (!activeVariable) return;
    const updated = {
      ...customizations,
      [activeVariable]: newColor,
    };
    setCustomizations(updated);
    saveCustomizations(theme, updated);
    applyThemeCustomizations(theme);

    // Sync with Convex
    if (updateSettings) {
      const allConfigsJson = localStorage.getItem("themeCustomizations") || "{}";
      void updateSettings({ customizations: allConfigsJson });
    }
  };

  const handleResetTheme = () => {
    clearCustomizations(theme);
    setCustomizations({});
    applyThemeCustomizations(theme);
    setActiveVariable(null);

    // Sync with Convex
    if (updateSettings) {
      const allConfigsJson = localStorage.getItem("themeCustomizations") || "{}";
      void updateSettings({ customizations: allConfigsJson });
    }
  };

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
        {/* Section: Account Information */}
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>👤 Account Information</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 16 }}>
            Details associated with your active Study Calendar session.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              background: "var(--bg-primary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)"
            }}>
              <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-secondary)" }}>Email Address</span>
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {userEmail === undefined ? "Loading..." : userEmail ?? "Not set"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Appearance */}
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>🎨 Theme & Appearance</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 16 }}>
            Customize your app theme. Preferred theme will be saved automatically.
          </p>

          <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
            <button
              className={`btn ${theme === "dark" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setTheme("dark")}
              style={{ flex: "1 1 140px", padding: "16px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
            >
              <span style={{ fontSize: "1.5rem" }}>🌙</span>
              <strong>Dark Mode</strong>
            </button>
            <button
              className={`btn ${theme === "light" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setTheme("light")}
              style={{ flex: "1 1 140px", padding: "16px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
            >
              <span style={{ fontSize: "1.5rem" }}>☀️</span>
              <strong>Light Mode</strong>
            </button>
          </div>

          {/* Theme Color Customization sub-section */}
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 20 }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              ✨ Custom Theme Colors
            </h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 16 }}>
              Fine-tune colors for {theme === "dark" ? "Dark" : "Light"} Mode. Changes apply instantly.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
              <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: 10 }}>
                {COLOR_VARIABLES.map((v) => {
                  const val = customizations[v.key] || (theme === "dark" ? v.defaultDark : v.defaultLight);
                  const isEditing = activeVariable === v.key;
                  return (
                    <div
                      key={v.key}
                      onClick={() => setActiveVariable(v.key)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        background: isEditing ? "var(--accent-light)" : "var(--bg-primary)",
                        border: isEditing ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      <span style={{ fontSize: "0.88rem", fontWeight: 500, color: isEditing ? "var(--accent-primary)" : "var(--text-primary)" }}>
                        {v.label}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {val.toUpperCase()}
                        </span>
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            backgroundColor: val,
                            border: "1px solid var(--border-medium)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleResetTheme}
                  style={{ marginTop: 8, alignSelf: "flex-start", fontSize: "0.82rem", padding: "6px 12px" }}
                >
                  Reset Theme Overrides
                </button>
              </div>

              {activeVariable && (
                <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 280, padding: "0 4px" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                      EDITING: {COLOR_VARIABLES.find(x => x.key === activeVariable)?.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveVariable(null)}
                      style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.78rem", fontWeight: 500 }}
                    >
                      Close
                    </button>
                  </div>
                  <ColorPicker
                    color={customizations[activeVariable] || (theme === "dark" ? COLOR_VARIABLES.find(x => x.key === activeVariable)!.defaultDark : COLOR_VARIABLES.find(x => x.key === activeVariable)!.defaultLight)}
                    onChange={handleColorChange}
                    presets={getPresetsForVariable(activeVariable, theme)}
                  />
                </div>
              )}
            </div>
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

        {/* Section 4: Legal & About */}
        <div style={{
          marginTop: 12,
          padding: "16px 0",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16
        }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Study Calendar. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: 16 }}>
            <button 
              style={{ background: "none", border: "none", color: "var(--accent-primary)", font: "inherit", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline", padding: 0 }}
              onClick={() => setShowLegal("privacy")}
              id="privacy-link"
            >
              Privacy Policy
            </button>
            <button 
              style={{ background: "none", border: "none", color: "var(--accent-primary)", font: "inherit", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline", padding: 0 }}
              onClick={() => setShowLegal("terms")}
              id="terms-link"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      {showLegal === "privacy" && (
        <Modal title="Privacy Policy" onClose={() => setShowLegal(null)}>
          <div style={{ fontSize: "0.85rem", lineHeight: "1.5", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 12 }}>
            <p><strong>Effective Date: May 30, 2026</strong></p>
            <p>Your privacy is important to us. This Privacy Policy details how we handle information in the Study Calendar application.</p>
            
            <h4 style={{ color: "var(--text-primary)" }}>1. Data We Collect</h4>
            <p>We collect and store your email address (for authentication purposes), and study logs, task lists, calendar events, and academic exams you record.</p>

            <h4 style={{ color: "var(--text-primary)" }}>2. How We Use Data</h4>
            <p>Your data is processed strictly to display dashboards, track deadlines, aggregate study statistics, and provide core planning utilities.</p>

            <h4 style={{ color: "var(--text-primary)" }}>3. Security & Database</h4>
            <p>All data is hosted securely within Convex databases. We use secure modern cryptographical methods to ensure user account and token integrity.</p>

            <h4 style={{ color: "var(--text-primary)" }}>4. Deletion Rights</h4>
            <p>You can request to purge all associated entries, logs, and account records by contacting our support team or deleting them inside settings.</p>
          </div>
        </Modal>
      )}

      {showLegal === "terms" && (
        <Modal title="Terms of Service" onClose={() => setShowLegal(null)}>
          <div style={{ fontSize: "0.85rem", lineHeight: "1.5", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 12 }}>
            <p><strong>Effective Date: May 30, 2026</strong></p>
            <p>Welcome to Study Calendar. By signing up, you agree to these Terms of Service.</p>

            <h4 style={{ color: "var(--text-primary)" }}>1. User License</h4>
            <p>We grant you a non-commercial, personal, revocable license to plan academic schedules and record study activity.</p>

            <h4 style={{ color: "var(--text-primary)" }}>2. Disclaimer of Warranties</h4>
            <p>Study Calendar is provided "as is" and "as available". We do not guarantee that the tool will prevent exam failures or maintain 100% database uptime.</p>

            <h4 style={{ color: "var(--text-primary)" }}>3. Account Termination</h4>
            <p>We reserve the right to suspend or block access to accounts that violate normal usage patterns or threaten application database stability.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
