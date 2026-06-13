import type React from "react";
import { useEffect, useState } from "react";
import { useLanguage } from "../../../hooks/useLanguage";
import { playSynthSound } from "./sound";

const createChecklistTasks = (taskTexts: string[]) =>
	taskTexts.map((text, index) => ({
		id: index + 1,
		text,
		completed: index === 1,
	}));

export function ChecklistDemo() {
	const { t } = useLanguage();

	const [tasks, setTasks] = useState(() =>
		createChecklistTasks(t.landingPage.checklistTasks),
	);
	const [particles, setParticles] = useState<
		{ id: number; x: number; y: number; tx: number; ty: number }[]
	>([]);

	// Update tasks array on language change to reflect translations
	useEffect(() => {
		setTasks(createChecklistTasks(t.landingPage.checklistTasks));
	}, [t.landingPage.checklistTasks]);

	const handleToggleTask = (
		id: number,
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		playSynthSound("pop");

		const label = (e.currentTarget as HTMLElement).closest(
			".lp-check-item",
		) as HTMLElement | null;
		const rect = label?.getBoundingClientRect() ?? {
			left: 0,
			top: 0,
			width: 0,
			height: 0,
		};

		const clickX = rect.width / 2;
		const clickY = rect.height / 2;

		setTasks((prevTasks) =>
			prevTasks.map((t) =>
				t.id === id ? { ...t, completed: !t.completed } : t,
			),
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
					ty: Math.sin(angle) * distance,
				};
			});
			setParticles((prev) => [...prev, ...newParticles]);
			setTimeout(() => {
				setParticles((prev) =>
					prev.filter((p) => !newParticles.some((np) => np.id === p.id)),
				);
			}, 800);
		}
	};

	const completedCount = tasks.filter((t) => t.completed).length;
	const progressPercent = Math.round((completedCount / tasks.length) * 100);

	return (
		<>
			<span className="lp-demo-tag lp-tag-checklist">
				{t.landingPage.checklistTag}
			</span>
			<h3>{t.landingPage.demoChecklistTitle}</h3>
			<p className="lp-demo-desc">{t.landingPage.demoChecklistDesc}</p>

			<div className="lp-demo-interactive" style={{ position: "relative" }}>
				{/* Particle explosions mapping */}
				{particles.map((p) => {
					const particleStyle: React.CSSProperties &
						Record<"--tx" | "--ty", string> = {
						left: p.x,
						top: p.y,
						"--tx": `${p.tx}px`,
						"--ty": `${p.ty}px`,
					};

					return (
						<div key={p.id} className="lp-particle" style={particleStyle} />
					);
				})}

				<div className="lp-check-list">
					{tasks.map((task) => (
						<label
							key={task.id}
							className={`lp-check-item ${task.completed ? "completed" : ""}`}
						>
							<input
								type="checkbox"
								className="sr-only"
								checked={task.completed}
								onChange={(e) => handleToggleTask(task.id, e)}
							/>
							<div className="lp-check-box">✓</div>
							<span className="lp-check-text">{task.text}</span>
						</label>
					))}
				</div>

				<div className="lp-check-progress-container">
					<span
						style={{ fontSize: "0.82rem", color: "#a1a1aa", fontWeight: 600 }}
					>
						{t.landingPage.checklistProgressLabel}
					</span>
					<div className="lp-check-progress-bar-bg">
						<div
							className="lp-check-progress-bar-fill"
							style={{ width: `${progressPercent}%` }}
						/>
					</div>
					<span
						style={{
							fontSize: "0.82rem",
							fontWeight: 700,
							fontFamily: "monospace",
							color: "#3b82f6",
						}}
					>
						{progressPercent}%
					</span>
				</div>
			</div>
		</>
	);
}
