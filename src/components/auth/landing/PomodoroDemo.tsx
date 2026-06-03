import React, { useReducer, useEffect, useRef } from "react";
import { playSynthSound } from "./sound";

interface PomoState {
  minutes: number;
  running: boolean;
  logs: { id: number; time: string; label: string }[];
}

type PomoAction =
  | { type: "TICK" }
  | { type: "START_PAUSE" }
  | { type: "RESET" };

function pomoReducer(state: PomoState, action: PomoAction): PomoState {
  switch (action.type) {
    case "TICK": {
      if (state.minutes <= 1) {
        playSynthSound("success");
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        return {
          ...state,
          running: false,
          minutes: 25,
          logs: [
            {
              id: Date.now(),
              time: timeStr,
              label: "Mock Log: Completed Focus Session (25m)"
            },
            ...state.logs
          ]
        };
      }
      playSynthSound("tick");
      return {
        ...state,
        minutes: state.minutes - 1
      };
    }
    case "START_PAUSE": {
      playSynthSound("click");
      return {
        ...state,
        running: !state.running
      };
    }
    case "RESET": {
      playSynthSound("click");
      return {
        ...state,
        running: false,
        minutes: 25
      };
    }
    default:
      return state;
  }
}

export function PomodoroDemo() {
  const [state, dispatch] = useReducer(pomoReducer, {
    minutes: 25,
    running: false,
    logs: [
      { id: 1, time: "10:15", label: "Completed Chemistry prep (25m)" }
    ]
  });

  const { minutes: pomoMinutes, running: pomoRunning, logs: pomoLogs } = state;
  const pomoTimerRef = useRef<any>(null);

  useEffect(() => {
    if (pomoRunning) {
      pomoTimerRef.current = window.setInterval(() => {
        dispatch({ type: "TICK" });
      }, 1000);
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
    dispatch({ type: "START_PAUSE" });
  };

  const handleResetPomo = () => {
    dispatch({ type: "RESET" });
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
