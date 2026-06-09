export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  current: number;
  target: number;
  unlocked: boolean;
}

// Format local date string as YYYY-MM-DD
function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Calculate current consecutive study days streak
export function calculateStreak(logs: { date: string; duration?: number }[]): number {
  if (!logs || logs.length === 0) return 0;

  // Extract unique study dates with duration > 0
  const studyDates = new Set(
    logs.reduce<string[]>((acc, l) => {
      if (l.duration && l.duration > 0) {
        acc.push(l.date);
      }
      return acc;
    }, [])
  );

  if (studyDates.size === 0) return 0;

  const todayStr = getLocalDateString(new Date());

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  let currentStr = "";
  if (studyDates.has(todayStr)) {
    currentStr = todayStr;
  } else if (studyDates.has(yesterdayStr)) {
    currentStr = yesterdayStr;
  } else {
    // Neither today nor yesterday had study logs
    return 0;
  }

  let streak = 0;
  const currentDate = new Date(currentStr + "T00:00:00");

  while (true) {
    const checkStr = getLocalDateString(currentDate);
    if (studyDates.has(checkStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

import type { TranslationSchema } from "../i18n/translations";

// Calculate all achievements, progress, and unlock statuses
export function getAchievements(
  logs: { date: string; duration?: number; subjectId?: string }[],
  completedTasksCount: number,
  streak: number,
  t: TranslationSchema
): Badge[] {
  const studySessions = logs.filter((l) => l.duration && l.duration > 0);
  const totalMinutes = studySessions.reduce((acc, l) => acc + (l.duration || 0), 0);

  // Unique subjects count
  const subjects = new Set<string>();
  studySessions.forEach((l) => {
    if (l.subjectId) subjects.add(l.subjectId);
  });

  return [
    {
      id: "first_session",
      title: t.analytics.firstSessionTitle,
      description: t.analytics.firstSessionDesc,
      icon: "🌱",
      current: studySessions.length,
      target: 1,
      unlocked: studySessions.length >= 1,
    },
    {
      id: "study_hours",
      title: t.analytics.studyHoursTitle,
      description: t.analytics.studyHoursDesc,
      icon: "📚",
      current: totalMinutes,
      target: 600,
      unlocked: totalMinutes >= 600,
    },
    {
      id: "streak_5",
      title: t.analytics.streak5Title,
      description: t.analytics.streak5Desc,
      icon: "🔥",
      current: streak,
      target: 5,
      unlocked: streak >= 5,
    },
    {
      id: "explorer",
      title: t.analytics.explorerTitle,
      description: t.analytics.explorerDesc,
      icon: "🧭",
      current: subjects.size,
      target: 3,
      unlocked: subjects.size >= 3,
    },
    {
      id: "tasks_10",
      title: t.analytics.productiveTitle,
      description: t.analytics.productiveDesc,
      icon: "⚡",
      current: completedTasksCount,
      target: 10,
      unlocked: completedTasksCount >= 10,
    },
  ];
}

export function playAlertSound(type: "success" | "break" | "beep") {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();

    if (type === "success") {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.frequency.value = freq;
        osc.type = "sine";

        const startTime = audioCtx.currentTime + idx * 0.12;
        const duration = 0.35;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } else if (type === "break") {
      const notes = [440.00, 349.23];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.frequency.value = freq;
        osc.type = "triangle";

        const startTime = audioCtx.currentTime + idx * 0.25;
        const duration = 0.45;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } else {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 600;
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    }
  } catch (err) {
    console.error("Audio playback error:", err);
  }
}

