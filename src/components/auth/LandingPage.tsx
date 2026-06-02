import React, { useState, useEffect } from "react";
import { SignIn } from "./SignIn";
import { Modal } from "../ui/Modal";
import { playSynthSound } from "./landing/sound";
import { TiltCard } from "./landing/TiltCard";
import { PomodoroDemo } from "./landing/PomodoroDemo";
import { ChecklistDemo } from "./landing/ChecklistDemo";
import { CryptoDemo } from "./landing/CryptoDemo";
import { StreakDemo } from "./landing/StreakDemo";

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
          <TiltCard className="lp-demo-card" neonColor="#ef4444" disableTilt>
            <PomodoroDemo />
          </TiltCard>

          {/* Card 2: Interactive Tasks Checklist */}
          <TiltCard className="lp-demo-card" neonColor="#3b82f6" disableTilt>
            <ChecklistDemo />
          </TiltCard>

          {/* Card 3: Cryptography E2E Visualizer */}
          <TiltCard className="lp-demo-card" neonColor="#10b981" disableTilt>
            <CryptoDemo />
          </TiltCard>

          {/* Card 4: Streaks & Badges */}
          <TiltCard className="lp-demo-card" neonColor="#f59e0b" disableTilt>
            <StreakDemo />
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
