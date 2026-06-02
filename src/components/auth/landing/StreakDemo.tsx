import React, { useState } from "react";
import { playSynthSound } from "./sound";

export function StreakDemo() {
  const [streakCount, setStreakCount] = useState(4);
  const [showBadge, setShowBadge] = useState(false);

  const handleLogStudySession = () => {
    if (streakCount >= 5) return; // Cap at 5 for simulator
    playSynthSound("success");
    setStreakCount(5);
    setShowBadge(true);
  };

  const handleResetStreak = () => {
    playSynthSound("click");
    setStreakCount(4);
    setShowBadge(false);
  };

  return (
    <>
      <span className="lp-demo-tag lp-tag-streaks">Achievements</span>
      <h3>Streak & Badge Tracker</h3>
      <p className="lp-demo-desc">
        Streaks build academic discipline. Test log session to increment your calendar streak and unlock badges.
      </p>
      
      <div className="lp-demo-interactive">
        <div className="lp-streak-panel">
          <div className="lp-streak-flame-container">
            <div className="lp-streak-flame-glow" />
            <span className="lp-streak-flame">🔥</span>
          </div>

          <div className="lp-streak-details">
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#71717a", textTransform: "uppercase" }}>
              Streaks status
            </span>
            <div className="lp-streak-count">
              Streak: <span>{streakCount} Days</span>
            </div>
            
            {showBadge ? (
              <div className="lp-badge-unlocked" style={{ animation: "lpScaleIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
                🏆 Unlocked: Academic Champion (5d)
              </div>
            ) : (
              <span style={{ fontSize: "0.8rem", color: "#71717a" }}>
                Log 1 more session to unlock next badge
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={handleLogStudySession}
            disabled={streakCount === 5}
          >
            📝 Log Mock Session
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleResetStreak}>
            Reset
          </button>
        </div>
      </div>
    </>
  );
}
