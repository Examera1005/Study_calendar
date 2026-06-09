import React from "react";
import { formatDuration } from "../../utils/dateUtils";
import { useLanguage } from "../../hooks/useLanguage";

interface LeaderboardTabProps {
  leaderboard: any[] | undefined;
  profile: any;
}

export function LeaderboardTab({ leaderboard, profile }: LeaderboardTabProps) {
  const { t } = useLanguage();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card">
        <h3 style={{ marginBottom: 8 }}>{t.friends.leaderboardTitle}</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 20 }}>
          {t.friends.leaderboardDesc}
        </p>

        <div className="leaderboard-list">
          {leaderboard && leaderboard.length > 0 ? (
            leaderboard.map((user: any, idx: number) => {
              const rankEmoji = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
              const isSelf = user.userId === profile.userId;
              return (
                <div
                  key={user.userId}
                  className="leaderboard-row"
                  style={isSelf ? { border: "1px dashed var(--accent-primary)", background: "rgba(59, 130, 246, 0.04)" } : {}}
                >
                  <div className="leaderboard-rank">{rankEmoji}</div>
                  <div className="leaderboard-user">
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                      {user.username} {isSelf && <span style={{ fontSize: "0.75rem", background: "var(--accent-light)", color: "var(--accent-primary)", padding: "2px 6px", borderRadius: 4 }}>{t.friends.youLabel}</span>}
                    </div>
                    
                    {/* Subjects studied */}
                    {user.subjectsStudied.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                        {user.subjectsStudied.map((sub: any) => (
                          <span
                            key={sub.name}
                            style={{
                              fontSize: "0.75rem",
                              padding: "2px 8px",
                              borderRadius: "var(--radius-md)",
                              background: sub.color + "1A",
                              border: `1px solid ${sub.color}`,
                              color: sub.color,
                            }}
                          >
                            {sub.icon} {sub.name} ({Math.round(sub.duration)}{t.common.minutesUnit})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 6 }}>
                        {t.friends.noSubjectsLeaderboard}
                      </div>
                    )}

                    {/* Upcoming exams */}
                    {user.upcomingExams.length > 0 && (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 8, display: "flex", gap: 10 }}>
                        <strong>{t.friends.preparingFor}</strong>
                        {user.upcomingExams.map((ex: any) => (
                          <span key={ex.title}>
                            {ex.title} ({ex.date})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="leaderboard-time">
                    {formatDuration(user.totalDuration)}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
              {t.friends.noGuildMembers}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
