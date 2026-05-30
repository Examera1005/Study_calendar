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
export function getLocalDateString(d: Date = new Date()): string {
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
    logs
      .filter((l) => l.duration && l.duration > 0)
      .map((l) => l.date)
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

// Calculate all achievements, progress, and unlock statuses
export function getAchievements(
  logs: { date: string; duration?: number; subjectId?: string }[],
  completedTasksCount: number,
  streak: number
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
      title: "Premier Pas",
      description: "Loggez votre première session d'étude",
      icon: "🌱",
      current: studySessions.length,
      target: 1,
      unlocked: studySessions.length >= 1,
    },
    {
      id: "study_hours",
      title: "Érudit",
      description: "Cumulez 10 heures d'étude (600 minutes)",
      icon: "📚",
      current: totalMinutes,
      target: 600,
      unlocked: totalMinutes >= 600,
    },
    {
      id: "streak_5",
      title: "Régularité",
      description: "Atteignez une série d'étude de 5 jours consécutifs",
      icon: "🔥",
      current: streak,
      target: 5,
      unlocked: streak >= 5,
    },
    {
      id: "explorer",
      title: "Explorateur",
      description: "Étudiez 3 matières différentes",
      icon: "🧭",
      current: subjects.size,
      target: 3,
      unlocked: subjects.size >= 3,
    },
    {
      id: "tasks_10",
      title: "Productif",
      description: "Complétez 10 tâches d'apprentissage",
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

