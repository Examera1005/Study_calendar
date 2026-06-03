import type { View } from "../../App";

type Props = {
  view: View;
  onOpenMenu: () => void;
  onJumpToDashboard: () => void;
  stopwatchActive: boolean;
  stopwatchRunning: boolean;
};

const TITLES: Record<View, string> = {
  dashboard: "🏠 Dashboard",
  calendar: "📅 Calendar",
  analytics: "📊 Stats & Badges",
  pomodoro: "🍅 Pomodoro",
  exams: "🎯 Exams",
  tasks: "✅ Tasks",
  log: "📝 Daily Log",
  friends: "👥 Friends",
  subjects: "📚 Subjects",
  settings: "⚙️ Settings",
};

export function MobileHeader({ view, onOpenMenu, onJumpToDashboard, stopwatchActive, stopwatchRunning }: Props) {
  if (!stopwatchActive) {
    return (
      <div className="mobile-header">
        <button type="button" className="hamburger-btn" aria-label="Open navigation menu" onClick={onOpenMenu}>
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <span className="mobile-header-title">{TITLES[view]}</span>
      </div>
    );
  }

  return (
    <div className="mobile-header">
      <button type="button" className="hamburger-btn" aria-label="Open navigation menu" onClick={onOpenMenu}>
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <span className="mobile-header-title">{TITLES[view]}</span>
      <button type="button" className="mobile-active-timer" onClick={onJumpToDashboard} style={{ fontFamily: "inherit" }}>
        {stopwatchRunning ? (
          <>
            <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--danger)" }} />
            <span>LIVE</span>
          </>
        ) : (
          <>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--warning)" }} />
            <span>PAUSED</span>
          </>
        )}
      </button>
    </div>
  );
}
