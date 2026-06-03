import React from "react";

interface ProfileSetupProps {
  usernameInput: string;
  setUsernameInput: (v: string) => void;
  isSubmittingProfile: boolean;
  profileError: string;
  handleCreateProfile: (e: React.FormEvent) => void;
}

export function ProfileSetup({
  usernameInput,
  setUsernameInput,
  isSubmittingProfile,
  profileError,
  handleCreateProfile,
}: ProfileSetupProps) {
  return (
    <div className="card" style={{ maxWidth: 450, margin: "60px auto", padding: 30 }}>
      <h2 style={{ textAlign: "center", marginBottom: 10 }}>👥 Setup Friends Handle</h2>
      <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", textAlign: "center", marginBottom: 24 }}>
        Choose a unique handle to connect with friends, share exam schedules, and rank on the leaderboard.
      </p>

      {profileError && <div className="error-msg" style={{ marginBottom: 16 }}>{profileError}</div>}

      <form onSubmit={handleCreateProfile}>
        <div className="form-group">
          <label htmlFor="friends-username">Choose @username</label>
          <input
            id="friends-username"
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="e.g. math_wizard"
            required
          />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4, display: "block" }}>
            Only letters, numbers, and underscores allowed. We will automatically prepend "@".
          </span>
        </div>

        <div style={{ background: "var(--accent-light)", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--accent-primary)", marginBottom: 24 }}>
          <div style={{ fontSize: "0.8rem", color: "var(--accent-primary)", fontWeight: 700, marginBottom: 4 }}>
            🔒 End-to-End Encrypted Messaging
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
            Creating a profile generates a secure 2048-bit RSA key pair in your browser. All chat messages are cryptographically sealed locally before sending.
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={isSubmittingProfile}>
          {isSubmittingProfile ? "Generating Cryptographic Keys..." : "Register Profile"}
        </button>
      </form>
    </div>
  );
}
