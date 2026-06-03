import { useEffect, useReducer } from "react";

type Status = "idle" | "running" | "paused";

export type StopwatchState = {
  status: Status;
  startTime: number | null;
  accumulated: number;
  elapsed: number;
};

type Action =
  | { type: "LOAD"; payload: StopwatchState }
  | { type: "START"; now: number }
  | { type: "PAUSE"; now: number }
  | { type: "RESUME"; now: number }
  | { type: "TICK"; now: number }
  | { type: "STOP" };

function reducer(state: StopwatchState, action: Action): StopwatchState {
  switch (action.type) {
    case "LOAD":
      return action.payload;
    case "START":
      return { status: "running", startTime: action.now, accumulated: 0, elapsed: 0 };
    case "PAUSE": {
      if (state.status !== "running" || state.startTime === null) return state;
      const totalElapsed = state.accumulated + Math.floor((action.now - state.startTime) / 1000);
      return { status: "paused", startTime: null, accumulated: totalElapsed, elapsed: totalElapsed };
    }
    case "RESUME": {
      if (state.status !== "paused") return state;
      return { status: "running", startTime: action.now, accumulated: state.accumulated, elapsed: state.accumulated };
    }
    case "TICK": {
      if (state.status !== "running" || state.startTime === null) return state;
      const totalElapsed = state.accumulated + Math.floor((action.now - state.startTime) / 1000);
      return { ...state, elapsed: totalElapsed };
    }
    case "STOP":
      return { status: "idle", startTime: null, accumulated: 0, elapsed: 0 };
  }
}

function init(): StopwatchState {
  if (typeof window === "undefined") {
    return { status: "idle", startTime: null, accumulated: 0, elapsed: 0 };
  }
  const status = (localStorage.getItem("studyTimerStatus") as Status) || "idle";
  const startStr = localStorage.getItem("studyTimerStart");
  const startTime = startStr ? Number(startStr) : null;
  const accumStr = localStorage.getItem("studyTimerAccumulated");
  const accumulated = accumStr ? Number(accumStr) : 0;

  let elapsed = accumulated;
  if (status === "running" && startTime !== null) {
    elapsed = accumulated + Math.floor((Date.now() - startTime) / 1000);
  }

  return { status, startTime, accumulated, elapsed };
}

export type StopwatchApi = StopwatchState & {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => number;
};

export function useStopwatch(): StopwatchApi {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  useEffect(() => {
    if (state.status !== "running") return;
    const id = setInterval(() => {
      dispatch({ type: "TICK", now: Date.now() });
    }, 1000);
    return () => clearInterval(id);
  }, [state.status]);

  // Persist to localStorage. Strip keys on idle so a fresh session starts clean.
  useEffect(() => {
    localStorage.setItem("studyTimerStatus", state.status);
    if (state.status === "idle") {
      localStorage.removeItem("studyTimerStart");
      localStorage.removeItem("studyTimerAccumulated");
    } else {
      localStorage.setItem("studyTimerStart", String(state.startTime));
      localStorage.setItem("studyTimerAccumulated", String(state.accumulated));
    }
  }, [state.status, state.startTime, state.accumulated]);

  return {
    ...state,
    start: () => dispatch({ type: "START", now: Date.now() }),
    pause: () => dispatch({ type: "PAUSE", now: Date.now() }),
    resume: () => dispatch({ type: "RESUME", now: Date.now() }),
    stop: () => {
      const finalMins = Math.max(1, Math.round(state.elapsed / 60));
      dispatch({ type: "STOP" });
      return finalMins;
    },
  };
}
