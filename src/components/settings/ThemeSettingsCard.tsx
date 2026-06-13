import { useMutation, useQuery } from "convex/react";
import { useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { useLanguage } from "../../hooks/useLanguage";
import {
	applyThemeCustomizations,
	clearCustomizations,
	getCustomizationsRawJson,
	loadCustomizations,
	saveCustomizations,
} from "../../utils/colorUtils";
import { ColorPicker } from "../ui/ColorPicker";

const getPresetsForVariable = (
	variable: string,
	themeMode: "light" | "dark",
) => {
	if (variable === "--accent-primary" || variable === "--accent-glow") {
		return [
			"#3b82f6",
			"#6366f1",
			"#8b5cf6",
			"#ec4899",
			"#ef4444",
			"#f97316",
			"#f59e0b",
			"#10b981",
			"#14b8a6",
			"#64748b",
			"#1b1c1d",
			"#f8fafc",
		];
	}
	if (variable.includes("--bg-")) {
		return themeMode === "dark"
			? ["#1b1c1d", "#141b2b", "#0f172a", "#1e1e2e", "#121212", "#18181b"]
			: ["#f8fafc", "#f9fafb", "#f4f4f5", "#fafaf9", "#f5f5f7", "#ffffff"];
	}
	return themeMode === "dark"
		? ["#ffffff", "#f8fafc", "#e2e8f0", "#cbd5e1", "#94a3b8", "#90a9cb"]
		: ["#0f172a", "#1e293b", "#334155", "#475569", "#64748b", "#94a3b8"];
};

const COLOR_VARIABLES = [
	{ key: "--accent-primary", defaultDark: "#3b82f6", defaultLight: "#2563eb" },
	{ key: "--accent-glow", defaultDark: "#3b82f6", defaultLight: "#2563eb" },
	{ key: "--bg-primary", defaultDark: "#1b1c1d", defaultLight: "#f8fafc" },
	{ key: "--bg-secondary", defaultDark: "#141b2b", defaultLight: "#ffffff" },
	{ key: "--text-primary", defaultDark: "#ffffff", defaultLight: "#0f172a" },
	{ key: "--text-secondary", defaultDark: "#90a9cb", defaultLight: "#475569" },
];

interface ThemeSettingsCardProps {
	theme: "light" | "dark";
	setTheme: (t: "light" | "dark") => void;
}

export function ThemeSettingsCard({ theme, setTheme }: ThemeSettingsCardProps) {
	// Theme customizations from Convex
	const userSettings = useQuery(api.userSettings.get);
	const updateSettings = useMutation(api.userSettings.update);
	const { t } = useLanguage();

	// Theme customizations state
	const [customizations, setCustomizations] = useState<Record<string, string>>(
		() => loadCustomizations(theme),
	);
	const [activeVariable, setActiveVariable] = useState<string | null>(null);

	const prevThemeRef = useRef(theme);
	if (theme !== prevThemeRef.current) {
		prevThemeRef.current = theme;
		setCustomizations(loadCustomizations(theme));
		setActiveVariable(null);
	}

	const lastSyncedCustomizationsRef = useRef<string | null>(null);
	if (
		userSettings?.customizations &&
		userSettings.customizations !== lastSyncedCustomizationsRef.current
	) {
		lastSyncedCustomizationsRef.current = userSettings.customizations;
		try {
			const allConfigs = JSON.parse(userSettings.customizations);
			const activeCustomizations = allConfigs[theme] || {};
			setCustomizations(activeCustomizations);
		} catch (e) {
			console.error("Failed to parse user settings customizations:", e);
		}
	}

	const getVarLabel = (key: string) => {
		switch (key) {
			case "--accent-primary":
				return t.settings.themeAccentPrimary;
			case "--accent-glow":
				return t.settings.themeAccentGlow;
			case "--bg-primary":
				return t.settings.themeBgPrimary;
			case "--bg-secondary":
				return t.settings.themeBgSecondary;
			case "--text-primary":
				return t.settings.themeTextPrimary;
			case "--text-secondary":
				return t.settings.themeTextSecondary;
			default:
				return key;
		}
	};

	const handleColorChange = (newColor: string) => {
		if (!activeVariable) return;
		const updated = {
			...customizations,
			[activeVariable]: newColor,
		};
		setCustomizations(updated);
		saveCustomizations(theme, updated);
		applyThemeCustomizations(theme);

		// Sync with Convex
		if (updateSettings) {
			const allConfigsJson = getCustomizationsRawJson();
			void updateSettings({ customizations: allConfigsJson });
		}
	};

	const handleResetTheme = () => {
		clearCustomizations(theme);
		setCustomizations({});
		applyThemeCustomizations(theme);
		setActiveVariable(null);

		// Sync with Convex
		if (updateSettings) {
			const allConfigsJson = getCustomizationsRawJson();
			void updateSettings({ customizations: allConfigsJson });
		}
	};

	return (
		<div className="card">
			<h3 style={{ marginBottom: 12 }}>{t.settings.themeTitle}</h3>
			<p
				style={{
					fontSize: "0.85rem",
					color: "var(--text-muted)",
					marginBottom: 16,
				}}
			>
				{t.settings.themeDesc}
			</p>

			<div
				style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}
			>
				<button
					type="button"
					className={`btn ${theme === "dark" ? "btn-primary" : "btn-secondary"}`}
					onClick={() => setTheme("dark")}
					style={{
						flex: "1 1 140px",
						padding: "16px 20px",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 8,
					}}
				>
					<span style={{ fontSize: "1.5rem" }}>🌙</span>
					<strong>{t.settings.themeDark}</strong>
				</button>
				<button
					type="button"
					className={`btn ${theme === "light" ? "btn-primary" : "btn-secondary"}`}
					onClick={() => setTheme("light")}
					style={{
						flex: "1 1 140px",
						padding: "16px 20px",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 8,
					}}
				>
					<span style={{ fontSize: "1.5rem" }}>☀️</span>
					<strong>{t.settings.themeLight}</strong>
				</button>
			</div>

			{/* Theme Color Customization sub-section */}
			<div
				style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 20 }}
			>
				<h4
					style={{
						fontSize: "0.95rem",
						fontWeight: 600,
						marginBottom: 8,
						display: "flex",
						alignItems: "center",
						gap: 6,
					}}
				>
					{t.settings.themeCustomTitle}
				</h4>
				<p
					style={{
						fontSize: "0.8rem",
						color: "var(--text-muted)",
						marginBottom: 16,
					}}
				>
					{t.settings.themeCustomDesc(theme)}
				</p>

				<div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
					<div
						style={{
							flex: "1 1 280px",
							display: "flex",
							flexDirection: "column",
							gap: 10,
						}}
					>
						{COLOR_VARIABLES.map((v) => {
							const val =
								customizations[v.key] ||
								(theme === "dark" ? v.defaultDark : v.defaultLight);
							const isEditing = activeVariable === v.key;
							return (
								<button
									key={v.key}
									type="button"
									onClick={() => setActiveVariable(v.key)}
									className="theme-customization-btn"
									style={{
										background: isEditing
											? "var(--accent-light)"
											: "var(--bg-primary)",
										border: isEditing
											? "1px solid var(--accent-primary)"
											: "1px solid var(--border-subtle)",
									}}
								>
									<span
										style={{
											fontSize: "0.88rem",
											fontWeight: 500,
											color: isEditing
												? "var(--accent-primary)"
												: "var(--text-primary)",
										}}
									>
										{getVarLabel(v.key)}
									</span>
									<div
										style={{ display: "flex", alignItems: "center", gap: 10 }}
									>
										<span
											style={{
												fontFamily: "monospace",
												fontSize: "0.8rem",
												color: "var(--text-muted)",
											}}
										>
											{val.toUpperCase()}
										</span>
										<div
											style={{
												width: 20,
												height: 20,
												borderRadius: "50%",
												backgroundColor: val,
												border: "1px solid var(--border-medium)",
											}}
										/>
									</div>
								</button>
							);
						})}

						<button
							type="button"
							className="btn btn-secondary"
							onClick={handleResetTheme}
							style={{
								marginTop: 8,
								alignSelf: "flex-start",
								fontSize: "0.82rem",
								padding: "6px 12px",
							}}
						>
							{t.settings.themeResetBtn}
						</button>
					</div>

					{activeVariable && (
						<div
							style={{
								flex: "0 0 auto",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 8,
							}}
						>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									width: "100%",
									maxWidth: 280,
									padding: "0 4px",
								}}
							>
								<span
									style={{
										fontSize: "0.78rem",
										fontWeight: 600,
										color: "var(--text-secondary)",
									}}
								>
									{t.settings.themeEditingLabel(getVarLabel(activeVariable))}
								</span>
								<button
									type="button"
									onClick={() => setActiveVariable(null)}
									style={{
										background: "none",
										border: "none",
										color: "var(--text-muted)",
										cursor: "pointer",
										fontSize: "0.78rem",
										fontWeight: 500,
									}}
								>
									{t.common.close}
								</button>
							</div>
							<ColorPicker
								color={
									customizations[activeVariable] ||
									(theme === "dark"
										? COLOR_VARIABLES.find((x) => x.key === activeVariable)
												?.defaultDark
										: COLOR_VARIABLES.find((x) => x.key === activeVariable)
												?.defaultLight)
								}
								onChange={handleColorChange}
								presets={getPresetsForVariable(activeVariable, theme)}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
