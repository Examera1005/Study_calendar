import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Modal } from "../components/ui/Modal";
import { ThemeSettingsCard } from "../components/settings/ThemeSettingsCard";
import { ProfileHandleCard } from "../components/settings/ProfileHandleCard";
import { BlockedUsersCard } from "../components/settings/BlockedUsersCard";
import { SettingsFooter } from "../components/settings/SettingsFooter";
import { TimerWidgetSettingsCard, type TimerCorner } from "../components/settings/TimerWidgetSettingsCard";

export function SettingsView({
  theme,
  setTheme,
  timerCorner,
  timerScale,
  onTimerCornerChange,
  onTimerScaleChange,
}: {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  timerCorner: TimerCorner;
  timerScale: number;
  onTimerCornerChange: (c: TimerCorner) => void;
  onTimerScaleChange: (s: number) => void;
}) {
  const friendsApi = (api as any).friends;
  const userEmail = useQuery(friendsApi.getUserEmail);
  const [showLegal, setShowLegal] = useState<"privacy" | "terms" | null>(null);

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

        {/* Theme Settings Card */}
        <ThemeSettingsCard theme={theme} setTheme={setTheme} />

        {/* Timer Widget Settings Card */}
        <TimerWidgetSettingsCard
          corner={timerCorner}
          scale={timerScale}
          onCornerChange={onTimerCornerChange}
          onScaleChange={onTimerScaleChange}
        />

        {/* Profile Handle Card */}
        <ProfileHandleCard />

        {/* Blocked Users Card */}
        <BlockedUsersCard />

        {/* Settings Footer */}
        <SettingsFooter onShowLegal={setShowLegal} />
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
