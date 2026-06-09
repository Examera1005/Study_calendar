import type { View } from "../../App";
import { useLanguage } from "../../hooks/useLanguage";

type Props = {
  view: View;
  onOpenMenu: () => void;
  onJumpToDashboard: () => void;
  stopwatchActive: boolean;
  stopwatchRunning: boolean;
};

export function MobileHeader({ view, onOpenMenu, onJumpToDashboard, stopwatchActive, stopwatchRunning }: Props) {
  const { t } = useLanguage();

  const getTitle = (v: View) => {
    switch (v) {
      case "dashboard": return `🏠 ${t.sidebar.dashboard}`;
      case "calendar": return `📅 ${t.sidebar.calendar}`;
      case "analytics": return `📊 ${t.sidebar.stats}`;
      case "pomodoro": return `🍅 ${t.sidebar.pomodoro}`;
      case "exams": return `🎯 ${t.sidebar.exams}`;
      case "tasks": return `✅ ${t.sidebar.tasks}`;
      case "log": return `📝 ${t.sidebar.dailyLog}`;
      case "friends": return `👥 ${t.sidebar.friends}`;
      case "subjects": return `📚 ${t.sidebar.subjects}`;
      case "settings": return `⚙️ ${t.sidebar.settings}`;
      default: return "";
    }
  };

  if (!stopwatchActive) {
    return (
      <div className="mobile-header">
        <button type="button" className="hamburger-btn" aria-label={t.mobileHeader.openMenu} onClick={onOpenMenu}>
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <span className="mobile-header-title">{getTitle(view)}</span>
      </div>
    );
  }

  return (
    <div className="mobile-header">
      <button type="button" className="hamburger-btn" aria-label={t.mobileHeader.openMenu} onClick={onOpenMenu}>
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <span className="mobile-header-title">{getTitle(view)}</span>
      <button type="button" className="mobile-active-timer" onClick={onJumpToDashboard} style={{ fontFamily: "inherit" }}>
        {stopwatchRunning ? (
          <>
            <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--danger)" }} />
            <span>{t.mobileHeader.live}</span>
          </>
        ) : (
          <>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--warning)" }} />
            <span>{t.mobileHeader.paused}</span>
          </>
        )}
      </button>
    </div>
  );
}
