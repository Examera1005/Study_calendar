import React, { useState } from "react";
import { playSynthSound } from "./sound";

export function ChecklistDemo() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Revise Math formula sheet", completed: false },
    { id: 2, text: "Design slide deck draft", completed: true },
    { id: 3, text: "Prepare Physics workbook exercise 4", completed: false },
    { id: 4, text: "Review SQL database schemas", completed: false }
  ]);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; tx: number; ty: number }[]>([]);

  const handleToggleTask = (id: number, e: React.MouseEvent | React.KeyboardEvent) => {
    playSynthSound("pop");
    
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // Safety check for click vs keyboard coordinates
    const clickX = ("clientX" in e && e.clientX !== undefined) ? e.clientX - rect.left : rect.width / 2;
    const clickY = ("clientY" in e && e.clientY !== undefined) ? e.clientY - rect.top : rect.height / 2;

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

    const targetTask = tasks.find((t) => t.id === id);
    const isNowCompleted = targetTask ? !targetTask.completed : false;

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
        setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
      }, 800);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <>
      <span className="lp-demo-tag lp-tag-checklist">Task Checklist</span>
      <h3>Interactive Task Checklist</h3>
      <p className="lp-demo-desc">
        Mark off tasks to update your daily progress bar. Satisfaction guaranteed with subtle micro-animations.
      </p>
      
      <div className="lp-demo-interactive" style={{ position: "relative" }}>
        {/* Particle explosions mapping */}
        {particles.map((p) => (
          <div 
            key={p.id}
            className="lp-particle"
            style={{
              left: p.x,
              top: p.y,
              ["--tx" as any]: `${p.tx}px`,
              ["--ty" as any]: `${p.ty}px`
            }}
          />
        ))}

        <div className="lp-check-list">
          {tasks.map((task) => (
            <button 
              key={task.id} 
              type="button"
              className={`lp-check-item ${task.completed ? "completed" : ""}`}
              onClick={(e) => handleToggleTask(task.id, e)}
              role="checkbox"
              aria-checked={task.completed}
            >
              <div className="lp-check-box">✓</div>
              <span className="lp-check-text">{task.text}</span>
            </button>
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
    </>
  );
}
