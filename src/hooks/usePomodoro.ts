import { useCallback, useEffect, useReducer, useRef } from "react";
import { playAlertSound } from "../utils/statsUtils";

type Status = "idle" | "running" | "paused";
type Mode = "work" | "break";

type State = {
	status: Status;
	mode: Mode;
	workDuration: number;
	breakDuration: number;
	timeLeft: number;
	elapsedSeconds: number;
};

type Action =
	| { type: "LOAD"; payload: State }
	| { type: "SET_STATUS"; status: Status }
	| { type: "SET_MODE"; mode: Mode }
	| { type: "SET_WORK"; workDuration: number }
	| { type: "SET_BREAK"; breakDuration: number }
	| { type: "TICK"; now: number }
	| {
			type: "COMPLETE";
			nextMode: Mode;
			nextStatus: Status;
			nextTimeLeft: number;
	  }
	| { type: "RESET"; workDuration: number };

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case "LOAD":
			return action.payload;
		case "SET_STATUS":
			return { ...state, status: action.status };
		case "SET_MODE":
			return { ...state, mode: action.mode };
		case "SET_WORK":
			return { ...state, workDuration: action.workDuration };
		case "SET_BREAK":
			return { ...state, breakDuration: action.breakDuration };
		case "TICK": {
			if (state.status !== "running" || state.timeLeft <= 1) return state;
			return {
				...state,
				timeLeft: state.timeLeft - 1,
				elapsedSeconds:
					state.mode === "work"
						? state.elapsedSeconds + 1
						: state.elapsedSeconds,
			};
		}
		case "COMPLETE":
			return {
				...state,
				mode: action.nextMode,
				status: action.nextStatus,
				timeLeft: action.nextTimeLeft,
				elapsedSeconds: 0,
			};
		case "RESET":
			return {
				...state,
				status: "idle",
				mode: "work",
				timeLeft: action.workDuration * 60,
				elapsedSeconds: 0,
			};
	}
}

function init(): State {
	if (typeof window === "undefined") {
		return {
			status: "idle",
			mode: "work",
			workDuration: 25,
			breakDuration: 5,
			timeLeft: 1500,
			elapsedSeconds: 0,
		};
	}
	const status = (localStorage.getItem("pomodoroStatus") as Status) || "idle";
	const mode = (localStorage.getItem("pomodoroMode") as Mode) || "work";
	const savedWork = localStorage.getItem("pomodoroWorkDuration");
	const workDuration = savedWork ? Number(savedWork) : 25;
	const savedBreak = localStorage.getItem("pomodoroBreakDuration");
	const breakDuration = savedBreak ? Number(savedBreak) : 5;
	const savedTimeLeft = localStorage.getItem("pomodoroTimeLeft");
	const timeLeft = savedTimeLeft
		? Number(savedTimeLeft)
		: mode === "work"
			? workDuration * 60
			: breakDuration * 60;
	const savedElapsed = localStorage.getItem("pomodoroElapsedSeconds");
	const elapsedSeconds = savedElapsed ? Number(savedElapsed) : 0;
	return {
		status,
		mode,
		workDuration,
		breakDuration,
		timeLeft,
		elapsedSeconds,
	};
}

export type PomodoroApi = {
	status: Status;
	mode: Mode;
	workDuration: number;
	breakDuration: number;
	displayTimeLeft: number;
	elapsedSeconds: number;
	setWorkDuration: (n: number) => void;
	setBreakDuration: (n: number) => void;
	start: () => void;
	pause: () => void;
	reset: () => void;
};

export function usePomodoro(): PomodoroApi {
	const [state, dispatch] = useReducer(reducer, undefined, init);
	const stateRef = useRef(state);
	stateRef.current = state;

	useEffect(() => {
		localStorage.setItem("pomodoroStatus", state.status);
		localStorage.setItem("pomodoroMode", state.mode);
		localStorage.setItem("pomodoroWorkDuration", String(state.workDuration));
		localStorage.setItem("pomodoroBreakDuration", String(state.breakDuration));
		localStorage.setItem("pomodoroTimeLeft", String(state.timeLeft));
		localStorage.setItem(
			"pomodoroElapsedSeconds",
			String(state.elapsedSeconds),
		);
	}, [
		state.status,
		state.mode,
		state.workDuration,
		state.breakDuration,
		state.timeLeft,
		state.elapsedSeconds,
	]);

	const handleComplete = useCallback(() => {
		const s = stateRef.current;
		if (s.mode === "work") {
			playAlertSound("success");
			if (s.breakDuration === 0) {
				dispatch({
					type: "COMPLETE",
					nextMode: "work",
					nextStatus: "idle",
					nextTimeLeft: s.workDuration * 60,
				});
			} else {
				dispatch({
					type: "COMPLETE",
					nextMode: "break",
					nextStatus: "paused",
					nextTimeLeft: s.breakDuration * 60,
				});
			}
		} else {
			playAlertSound("break");
			dispatch({
				type: "COMPLETE",
				nextMode: "work",
				nextStatus: "paused",
				nextTimeLeft: s.workDuration * 60,
			});
		}
	}, []);

	useEffect(() => {
		if (state.status !== "running") return;
		const id = window.setInterval(() => {
			const s = stateRef.current;
			if (s.timeLeft <= 1) {
				window.clearInterval(id);
				window.setTimeout(() => handleComplete(), 0);
			} else {
				dispatch({ type: "TICK", now: Date.now() });
			}
		}, 1000);
		return () => window.clearInterval(id);
	}, [state.status, handleComplete]);

	const displayTimeLeft =
		state.status === "idle"
			? state.mode === "work"
				? state.workDuration * 60
				: state.breakDuration * 60
			: state.timeLeft;

	return {
		status: state.status,
		mode: state.mode,
		workDuration: state.workDuration,
		breakDuration: state.breakDuration,
		displayTimeLeft,
		elapsedSeconds: state.elapsedSeconds,
		setWorkDuration: (n) => dispatch({ type: "SET_WORK", workDuration: n }),
		setBreakDuration: (n) => dispatch({ type: "SET_BREAK", breakDuration: n }),
		start: () => dispatch({ type: "SET_STATUS", status: "running" }),
		pause: () => dispatch({ type: "SET_STATUS", status: "paused" }),
		reset: () => dispatch({ type: "RESET", workDuration: state.workDuration }),
	};
}
