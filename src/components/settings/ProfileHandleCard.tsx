import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function ProfileHandleCard() {
  const friendsApi = (api as any).friends;
  const profile = useQuery(friendsApi.getProfile);
  const updateProfile = useMutation(friendsApi.createOrUpdateProfile);

  const [usernameInput, setUsernameInput] = useState("");
  const [{ isChecking, isAvailable, error: usernameError }, setCheckState] = useState({
    isChecking: false,
    isAvailable: null as boolean | null,
    error: "",
  });
  const [saveSuccess, setSaveSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateUsernameCheckState = (next: Partial<{ isChecking: boolean; isAvailable: boolean | null; error: string }>) => {
    setCheckState(prev => ({ ...prev, ...next }));
  };

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
      updateUsernameCheckState({ isAvailable: true, error: "", isChecking: false });
      return;
    }

    if (cleanInput.length < 3) {
      updateUsernameCheckState({ isAvailable: false, error: "Username must be at least 3 characters.", isChecking: false });
      return;
    }

    const hasInvalid = /[^a-z0-9_]/.test(cleanInput);
    if (hasInvalid) {
      updateUsernameCheckState({ isAvailable: false, error: "Only letters, numbers, and underscores allowed.", isChecking: false });
      return;
    }

    updateUsernameCheckState({ isChecking: true, isAvailable: null, error: "" });

    const delay = window.setTimeout(async () => {
      try {
        const formatted = "@" + cleanInput;
        const available = await (api as any).friends.checkUsernameAvailable({
          username: formatted,
        });
        updateUsernameCheckState({
          isAvailable: available,
          error: available ? "" : "Handle is already taken.",
          isChecking: false
        });
      } catch (err) {
        console.error(err);
        updateUsernameCheckState({ isChecking: false });
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
      setCheckState(prev => ({ ...prev, error: err.message || "Failed to update profile." }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
            <label htmlFor="settings-username">Change @username</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <span style={{ position: "absolute", left: 12, color: "var(--text-muted)", fontWeight: 600 }}>@</span>
              <input
                id="settings-username"
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="e.g. math_wizard"
                style={{ paddingLeft: 28 }}
                required
              />
            </div>

            <div style={{ marginTop: 8, fontSize: "0.8rem" }}>
              {isChecking && <span style={{ color: "var(--text-muted)" }}>Checking availability…</span>}
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
  );
}
