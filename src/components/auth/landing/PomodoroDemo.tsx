import React, { useState, useEffect, useRef } from "react";
import { playSynthSound } from "./sound";

export function PomodoroDemo() {
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoLogs, setPomoLogs] = useState<{ id: number; time: string; label: string }[]>([
    { id: 1, time: "10:15", label: "Completed Chemistry prep (25m)" }
  ]);
  const pomoTimerRef = useRef<any>(null);

  useEffect(() => {
    if (pomoRunning) {
      pomoTimerRef.current = setInterval(() => {
        setPomoMinutes((prevMins) => {
          if (prevMins <= 1) {
            // Complete timer!
            if (pomoTimerRef.current) {
              clearInterval(pomoTimerRef.current);
              pomoTimerRef.current = null;
            }
            setPomoRunning(false);
            playSynthSound("success");
            
            // Add study log entry
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
            setPomoLogs((prev) => [
              {
                id: Date.now(),
                time: timeStr,
                label: "Mock Log: Completed Focus Session (25m)"
              },
              ...prev
            ]);
            return 25;
          }
          playSynthSound("tick");
          return prevMins - 1;
        });
      }, 1000); // 1 tick per second: counts down 25 virtual minutes in exactly 25 seconds
    } else {
      if (pomoTimerRef.current) {
        clearInterval(pomoTimerRef.current);
        pomoTimerRef.current = null;
      }
    }

    return () => {
      if (pomoTimerRef.current) {
        clearInterval(pomoTimerRef.current);
        pomoTimerRef.current = null;
      }
    };
  }, [pomoRunning]);

  const handleStartPomo = () => {
    playSynthSound("click");
    setPomoRunning((prev) => !prev);
  };

  const handleResetPomo = () => {
    playSynthSound("click");
    setPomoRunning(false);
    setPomoMinutes(25);
  };

  // Radial progress calculations
  const pomoProgressPercent = 1 - pomoMinutes / 25;
  const strokeDashoffset = 314 - 314 * pomoProgressPercent;

  return (
    <>
      <span className="lp-demo-tag lp-tag-pomodoro">Focus Engine</span>
      <h3>Pomodoro & Logging Simulator</h3>
      <p className="lp-demo-desc">
        Start the focus session. The 25-minute countdown is accelerated to complete in exactly 25 seconds (1 minute per second) to show the log sync.
      </p>
      
      <div className="lp-demo-interactive">
        <div className="lp-pomo-flex">
          <div className="lp-pomo-timer-circle">
            <svg className="lp-pomo-svg">
              <circle className="lp-pomo-bg-ring" cx="60" cy="60" r="50" />
              <circle 
                className="lp-pomo-progress-ring" 
                cx="60" 
                cy="60" 
                r="50" 
                strokeDasharray="314"
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="lp-pomo-time-display">
              {String(pomoMinutes).padStart(2, "0")}:00
            </div>
          </div>

          <div className="lp-pomo-controls">
            <span className="lp-pomo-state-text">
              {pomoRunning ? "🔥 Focus Active (Simulated)" : "⏱️ Session Idle"}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button 
                type="button"
                className="btn btn-primary btn-sm" 
                onClick={handleStartPomo}
                aria-label={pomoRunning ? "Pause Pomodoro Timer" : "Start Pomodoro Timer"}
              >
                {pomoRunning ? "⏸️ Pause" : "▶️ Start"}
              </button>
              <button 
                type="button"
                className="btn btn-secondary btn-sm" 
                onClick={handleResetPomo}
                aria-label="Reset Pomodoro Timer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="lp-pomo-logs">
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#71717a", textTransform: "uppercase" }}>
            Logged Sessions:
          </div>
          {pomoLogs.map((log) => (
            <div key={log.id} className="lp-pomo-log-item">
              <span>{log.label}</span>
              <span style={{ color: "#71717a", fontFamily: "monospace" }}>{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
