import React, { useState, useEffect, useRef } from "react";
import { SignIn } from "./SignIn";
import { Modal } from "../ui/Modal";

// Native Sound Engine using Web Audio API: lazy-loaded shared context for optimal browser performance
let sharedAudioCtx: AudioContext | null = null;

function playSynthSound(type: "success" | "tick" | "click" | "pop") {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioContextClass();
    }
    const ctx = sharedAudioCtx;
    
    // Resume context if suspended (browser security autoplays)
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      // Arpeggio sound
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === "tick") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === "pop") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(250, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    }
  } catch (e) {
    // Fail silently if audio output is blocked
  }
}

// Reusable 3D Tilt Card component for premium tactile micro-interactions and custom neon glows
function TiltCard({
  children,
  className = "",
  neonColor = "#3b82f6",
}: {
  children: React.ReactNode;
  className?: string;
  neonColor?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const maxTilt = 8; // Max tilt rotation angle in degrees

    // Weight physics: pushing the mouse down acts as weight tilt X and Y
    const rotateX = -((y - centerY) / centerY) * maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  };

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transform,
        transition: isHovered 
          ? "border-color 0.3s ease, box-shadow 0.3s ease" 
          : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease",
        transformStyle: "preserve-3d",
        borderColor: isHovered ? neonColor : "",
        boxShadow: isHovered 
          ? `0 15px 35px rgba(0, 0, 0, 0.4), 0 0 20px ${neonColor}33` 
          : "",
      }}
    >
      <div style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d", height: "100%", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  // SEO Updates
  useEffect(() => {
    document.title = "Study Calendar — The Premium Planner & Productivity Toolkit";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "A premium study productivity app. Track exams, calendar schedules, tasks, and daily logs, with Pomodoro timers, statistics, and client-side encrypted friend messaging."
      );
    }
  }, []);

  // Prevent memory leaks by cleaning up intervals on unmount
  useEffect(() => {
    return () => {
      if (scrambleIntervalRef.current) clearInterval(scrambleIntervalRef.current);
      cryptoTimeoutsRef.current.forEach((id) => clearTimeout(id));
    };
  }, []);



  // ==================== POMODORO SIMULATOR STATE ====================
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
            clearInterval(pomoTimerRef.current);
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
      if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
    }

    return () => {
      if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
    };
  }, [pomoRunning]);

  const handleStartPomo = () => {
    playSynthSound("click");
    setPomoRunning(!pomoRunning);
  };

  const handleResetPomo = () => {
    playSynthSound("click");
    setPomoRunning(false);
    setPomoMinutes(25);
  };

  // Radial progress calculations
  const pomoProgressPercent = 1 - pomoMinutes / 25;
  const strokeDashoffset = 314 - 314 * pomoProgressPercent;

  // ==================== CHECKLIST SIMULATOR STATE ====================
  const [tasks, setTasks] = useState([
    { id: 1, text: "Revise Math formula sheet", completed: false },
    { id: 2, text: "Design slide deck draft", completed: true },
    { id: 3, text: "Prepare Physics workbook exercise 4", completed: false },
    { id: 4, text: "Review SQL database schemas", completed: false }
  ]);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; tx: number; ty: number }[]>([]);

  const handleToggleTask = (id: number, e: React.MouseEvent) => {
    playSynthSound("pop");
    
    // If checking, trigger particles at click position
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

    const isNowCompleted = !tasks.find(t => t.id === id)?.completed;
    if (isNowCompleted) {
      const newParticles = Array.from({ length: 6 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 40;
        return {
          id: Date.now() + i,
          x: clickX,
          y: clickY,
          tx: Math.cos(angle) * distance,
          ty: Math.sin(angle) * distance
        };
      });
      setParticles((prev) => [...prev, ...newParticles]);
      setTimeout(() => {
        setParticles((prev) => prev.filter(p => !newParticles.find(np => np.id === p.id)));
      }, 800);
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

    // ==================== E2E CRYPTO SIMULATOR STATE ====================
    const [cryptoMessage, setCryptoMessage] = useState("Let's review the calculus answers together!");
    const [cryptoStage, setCryptoStage] = useState<"plain" | "encrypting" | "cipher" | "transmitting" | "decrypting" | "done">("plain");
    const [scrambledText, setScrambledText] = useState(cryptoMessage);
    const scrambleIntervalRef = useRef<any>(null);
    const cryptoTimeoutsRef = useRef<any[]>([]);

    const clearCryptoTimers = () => {
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current);
        scrambleIntervalRef.current = null;
      }
      cryptoTimeoutsRef.current.forEach((id) => clearTimeout(id));
      cryptoTimeoutsRef.current = [];
    };

    const scheduleTimeout = (fn: () => void, delay: number) => {
      const id = setTimeout(fn, delay);
      cryptoTimeoutsRef.current.push(id);
    };

    const startCryptoProcess = () => {
      if (cryptoStage !== "plain" && cryptoStage !== "done") return;
      
      clearCryptoTimers();
      playSynthSound("click");
      setCryptoStage("encrypting");
      
      // Scramble letters
      let tickCount = 0;
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':\",./<>?";
      
      scrambleIntervalRef.current = setInterval(() => {
        setScrambledText((prev) => 
          prev.split("").map((c, i) => {
            if (c === " ") return " ";
            // Gradually fix characters from left to right as time goes on
            if (i < tickCount * 4) {
              return "x"[0];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          }).join("")
        );
        playSynthSound("tick");

        tickCount++;
        if (tickCount > 10) {
          if (scrambleIntervalRef.current) {
            clearInterval(scrambleIntervalRef.current);
            scrambleIntervalRef.current = null;
          }
          
          // Solidify to hex block
          setScrambledText("0x3FA91B2E00C6758410EFDC7B9923AA991206C55B");
          setCryptoStage("cipher");

          // Start Transmission
          scheduleTimeout(() => {
            setCryptoStage("transmitting");
            // Travel across pipeline
            scheduleTimeout(() => {
              setCryptoStage("decrypting");
              
              // Decrypt scramble back
              let decryptTick = 0;
              const originalWords = cryptoMessage.split("");
              
              scrambleIntervalRef.current = setInterval(() => {
                setScrambledText(() => 
                  originalWords.map((char, index) => {
                    if (char === " ") return " ";
                    if (index < decryptTick * 4) return char;
                    return chars[Math.floor(Math.random() * chars.length)];
                  }).join("")
                );
                playSynthSound("tick");
                
                decryptTick++;
                if (decryptTick > 10) {
                  if (scrambleIntervalRef.current) {
                    clearInterval(scrambleIntervalRef.current);
                    scrambleIntervalRef.current = null;
                  }
                  setScrambledText(cryptoMessage);
                  setCryptoStage("done");
                  playSynthSound("success");
                }
              }, 80);

            }, 1500);
          }, 1000);
        }
      }, 80);
    };

    const handleResetCrypto = () => {
      playSynthSound("click");
      clearCryptoTimers();
      setCryptoStage("plain");
      setScrambledText(cryptoMessage);
    };

  // ==================== STREAK & BADGE SIMULATOR STATE ====================
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
    <div className="lp-wrapper">
      {/* Background blurs */}
      <div className="lp-glow" />
      <div className="lp-glow-secondary" />

      {/* Header */}
      <header className="lp-header">
        <div className="lp-logo-container">
          <span>📚 Study Calendar</span>
          <span className="lp-logo-badge">V2.0</span>
        </div>
        <nav className="lp-nav">
          <a className="lp-nav-link" href="#features">Features</a>
          <a className="lp-nav-link" href="#playground">Interactive Demo</a>
          <button 
            id="lp-nav-signin-btn"
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: "var(--radius-md)" }}
            onClick={() => { playSynthSound("click"); setShowAuthModal(true); }}
          >
            Sign In
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="lp-hero">
      
        
        <h1>
          <span className="lp-title-sans">The tactile study planner,</span>
          <br />
          <span className="lp-title-sans">built for </span>
          <span className="lp-gradient-accent lp-title-serif">digital minds.</span>
        </h1>
        
        <p className="lp-hero-desc">
          Organize exams, time study sessions, build daily logs, and coordinate with friends in real-time. Beautifully structured, completely customizable, and fully end-to-end encrypted.
        </p>

        <div className="lp-cta-group">
          <button 
            id="lp-hero-getstarted-btn"
            className="btn lp-btn lp-btn-primary"
            onClick={() => { playSynthSound("click"); setShowAuthModal(true); }}
          >
            Get Started Free →
          </button>
          <a href="#playground" className="btn lp-btn lp-btn-outline">
            Try Live Sandbox
          </a>
        </div>

        {/* Floating App Mock Elements */}
        <div className="lp-hero-visual">
          <div className="lp-floating-card lp-fc-1">
            <div className="lp-fc-header">
              <span>🎯 Upcoming Exams</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                <span style={{ fontWeight: 600 }}>🧮 Calculus II</span>
                <span style={{ color: "var(--danger)", fontWeight: 700 }}>In 2 days</span>
              </div>
              <div style={{ height: 4, background: "rgba(255, 255, 255, 0.05)", borderRadius: 2 }}>
                <div style={{ width: "85%", height: "100%", background: "var(--danger)", borderRadius: 2 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginTop: 4 }}>
                <span style={{ fontWeight: 600 }}>🧪 Organic Chemistry</span>
                <span style={{ color: "var(--warning)", fontWeight: 700 }}>In 5 days</span>
              </div>
              <div style={{ height: 4, background: "rgba(255, 255, 255, 0.05)", borderRadius: 2 }}>
                <div style={{ width: "40%", height: "100%", background: "var(--warning)", borderRadius: 2 }} />
              </div>
            </div>
          </div>

          <div className="lp-floating-card lp-fc-2">
            <div className="lp-fc-header">
              <span>👥 Friendship Arena</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.82rem" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", color: "#fff" }}>
                A
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: "#fff" }}>Alice (Online)</div>
                <div style={{ fontSize: "0.72rem", color: "#10b981" }}>Studying Database Systems</div>
              </div>
              <span style={{ fontSize: "1.1rem" }}>⚡ 5d</span>
            </div>
          </div>

          <div className="lp-floating-card lp-fc-3">
            <div className="lp-fc-header" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>🔥 Daily Consistency Streak</span>
              <span style={{ color: "#f59e0b", fontWeight: 700 }}>Level 4 Planner</span>
            </div>
            <div className="lp-fc-streak">
              <span className="lp-streak-num">05 <span>Days</span></span>
              <div className="lp-streak-dots">
                <div className="lp-streak-dot active" />
                <div className="lp-streak-dot active" />
                <div className="lp-streak-dot active" />
                <div className="lp-streak-dot active" />
                <div className="lp-streak-dot active" />
                <div className="lp-streak-dot" />
                <div className="lp-streak-dot" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="lp-features">
        <div className="lp-section-header">
          <h2>Everything you need to master your calendar</h2>
          <p>Ditch cluttered text docs and chaotic timers. Keep all aspects of your academic routine in one clean dashboard.</p>
        </div>

        <div className="lp-features-grid">
          <TiltCard className="lp-feat-card" neonColor="#3b82f6">
            <div className="lp-feat-icon">📅</div>
            <h3>Structured Timetable</h3>
            <p>Block out lectures, review blocks, and exam dates on a real-time calendar that syncs instantly across devices.</p>
          </TiltCard>

          <TiltCard className="lp-feat-card" neonColor="#ef4444">
            <div className="lp-feat-icon">🍅</div>
            <h3>Pomodoro Focus Sessions</h3>
            <p>Activate customizable work and break timers. Complete sessions automatically pipe logs into your agenda.</p>
          </TiltCard>

          <TiltCard className="lp-feat-card" neonColor="#10b981">
            <div className="lp-feat-icon">🔒</div>
            <h3>End-to-End Encrypted Chat</h3>
            <p>Message study partners with military-grade client-side encryption. Server never sees your text; keys are stored locally.</p>
          </TiltCard>

          <TiltCard className="lp-feat-card" neonColor="#f59e0b">
            <div className="lp-feat-icon">📊</div>
            <h3>Academic Analytics</h3>
            <p>Visualize statistics per course. Review total study durations, streak counters, and track badge achievements.</p>
          </TiltCard>
        </div>
      </section>

      {/* Interactive Workbench Sandbox */}
      <section id="playground" className="lp-workbench">
        <div className="lp-section-header">
          <h2>Test-drive the core planner engine</h2>
          <p>Interact with these fully functional mock blocks to see how Study Calendar keeps you on track, directly from the landing page.</p>
        </div>

        <div className="lp-demo-grid">
          {/* Card 1: Focus Engine */}
          <TiltCard className="lp-demo-card" neonColor="#ef4444">
            <span className="lp-demo-tag lp-tag-pomodoro">Focus Engine</span>
            <h3>Pomodoro & Logging Simulator</h3>
            <p className="lp-demo-desc">Start the focus session. The 25-minute countdown is accelerated to complete in exactly 25 seconds (1 minute per second) to show the log sync.</p>
            
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
                    <button className="btn btn-primary btn-sm" onClick={handleStartPomo}>
                      {pomoRunning ? "⏸️ Pause" : "▶️ Start"}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={handleResetPomo}>
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
          </TiltCard>

          {/* Card 2: Interactive Tasks Checklist */}
          <TiltCard className="lp-demo-card" neonColor="#3b82f6">
            <span className="lp-demo-tag lp-tag-checklist">Task Checklist</span>
            <h3>Interactive Task Checklist</h3>
            <p className="lp-demo-desc">Mark off tasks to update your daily progress bar. Satisfaction guaranteed with subtle micro-animations.</p>
            
            <div className="lp-demo-interactive" style={{ position: "relative" }}>
              {/* Particle explosions mapping */}
              {particles.map((p) => (
                <div 
                  key={p.id} 
                  style={{
                    position: "absolute",
                    left: p.x,
                    top: p.y,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#3b82f6",
                    pointerEvents: "none",
                    transform: "translate(-50%, -50%)",
                    animation: "lpExplode 0.8s ease-out forwards",
                    ["--tx" as any]: `${p.tx}px`,
                    ["--ty" as any]: `${p.ty}px`
                  }}
                />
              ))}

              <div className="lp-check-list">
                {tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`lp-check-item ${task.completed ? "completed" : ""}`}
                    onClick={(e) => handleToggleTask(task.id, e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleToggleTask(task.id, e as any);
                      }
                    }}
                    role="checkbox"
                    aria-checked={task.completed}
                    tabIndex={0}
                  >
                    <div className="lp-check-box">✓</div>
                    <span className="lp-check-text">{task.text}</span>
                  </div>
                ))}
              </div>

              <div className="lp-check-progress-container">
                <span style={{ fontSize: "0.82rem", color: "#a1a1aa", fontWeight: 600 }}>
                  Daily Completion:
                </span>
                <div className="lp-check-progress-bar-bg">
                  <div className="lp-check-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
                </div>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, fontFamily: "monospace", color: "#3b82f6" }}>
                  {progressPercent}%
                </span>
              </div>
            </div>
          </TiltCard>

          {/* Card 3: Cryptography E2E Visualizer */}
          <TiltCard className="lp-demo-card" neonColor="#10b981">
            <span className="lp-demo-tag lp-tag-crypto">Encryption Block</span>
            <h3>E2E Message Encryptor</h3>
            <p className="lp-demo-desc">We use local 2048-bit RSA keys. Test encryption on the browser; watch client text scramble and descramble at recipient side.</p>
            
            <div className="lp-demo-interactive">
              <div className="lp-crypto-panel">
                <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
                  {/* Sender Bubble */}
                  <div className="lp-crypto-bubble" style={{ flex: 1 }}>
                    <div className="lp-crypto-bubble-header">
                      <span>Alice (You)</span>
                      <span className="lp-crypto-key-badge">RSA Public</span>
                    </div>
                    {cryptoStage === "plain" ? (
                      <input 
                        type="text" 
                        value={cryptoMessage} 
                        onChange={(e) => { setCryptoMessage(e.target.value); setScrambledText(e.target.value); }}
                        style={{ background: "none", border: "none", padding: 0, fontSize: "0.85rem", color: "#ffffff", width: "100%" }}
                      />
                    ) : (
                      <div className="lp-crypto-text">{cryptoMessage}</div>
                    )}
                  </div>

                  {/* Recipient Bubble */}
                  <div className="lp-crypto-bubble" style={{ flex: 1 }}>
                    <div className="lp-crypto-bubble-header">
                      <span>Bob (Friend)</span>
                      <span className="lp-crypto-key-badge" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>Bob's Private</span>
                    </div>
                    <div className="lp-crypto-text" style={{ color: cryptoStage === "done" ? "#ffffff" : "#71717a" }}>
                      {cryptoStage === "plain" && "Waiting for encryption..."}
                      {cryptoStage === "encrypting" && scrambledText}
                      {cryptoStage === "cipher" && scrambledText}
                      {cryptoStage === "transmitting" && scrambledText}
                      {cryptoStage === "decrypting" && scrambledText}
                      {cryptoStage === "done" && scrambledText}
                    </div>
                  </div>
                </div>

                {/* Dotted Sync Pipeline */}
                <div className="lp-crypto-pipeline">
                  <div className="lp-crypto-pipeline-line" />
                  {cryptoStage !== "plain" && (
                    <div className={`lp-crypto-pipeline-dot ${cryptoStage === "transmitting" ? "animating" : ""}`} />
                  )}
                  <span style={{ position: "absolute", bottom: -8, fontSize: "0.68rem", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.05em", background: "#17191d", padding: "0 6px" }}>
                    {cryptoStage === "plain" && "Pre-encryption"}
                    {cryptoStage === "encrypting" && "Encrypting RSA-2048 Client-Side..."}
                    {cryptoStage === "cipher" && "Payload Scrambled"}
                    {cryptoStage === "transmitting" && "Transmitting over Convex SSL..."}
                    {cryptoStage === "decrypting" && "Decrypting Private Key..."}
                    {cryptoStage === "done" && "Secure Match Achieved"}
                  </span>
                </div>

                <div className="lp-crypto-actions">
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={startCryptoProcess}
                    disabled={cryptoStage !== "plain" && cryptoStage !== "done"}
                  >
                    🔐 Encrypt & Send
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={handleResetCrypto}
                  >
                    Clear Demo
                  </button>
                </div>
              </div>
            </div>
          </TiltCard>

          {/* Card 4: Streaks & Badges */}
          <TiltCard className="lp-demo-card" neonColor="#f59e0b">
            <span className="lp-demo-tag lp-tag-streaks">Achievements</span>
            <h3>Streak & Badge Tracker</h3>
            <p className="lp-demo-desc">Streaks build academic discipline. Test log session to increment your calendar streak and unlock badges.</p>
            
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
          </TiltCard>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="lp-cta-section">
        <h2>Take Control of Your Semester</h2>
        <p>Join students using Study Calendar to structure review sessions, track grades, collaborate safely, and build daily habits.</p>
        <button 
          className="lp-btn lp-btn-primary" 
          onClick={() => { playSynthSound("click"); setShowAuthModal(true); }}
        >
          Create Free Account
        </button>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div>© {new Date().getFullYear()} Study Calendar. Developed for academic excellence.</div>
        <div className="lp-footer-links">
          <a className="lp-footer-link" href="#features">Features</a>
          <a className="lp-footer-link" href="#playground">Interactive Sandbox</a>
          <span style={{ color: "rgba(255,255,255,0.05)" }}>•</span>
          <span style={{ color: "#71717a" }}>Real-time database powered by Convex</span>
        </div>
      </footer>

      {/* Backdrop blur Auth Modal */}
      {showAuthModal && (
        <Modal title="Sign In" onClose={() => setShowAuthModal(false)}>
          <SignIn />
        </Modal>
      )}
    </div>
  );
}
