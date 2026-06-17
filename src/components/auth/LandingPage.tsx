import React, { useEffect, useState } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import type { TranslationSchema } from "../../i18n/translations";
import { Modal } from "../ui/Modal";
import { ScrollReveal } from "../ui/ScrollReveal";
import { ChecklistDemo } from "./landing/ChecklistDemo";
import { CryptoDemo } from "./landing/CryptoDemo";
import { PomodoroDemo } from "./landing/PomodoroDemo";
import { StreakDemo } from "./landing/StreakDemo";
import { playSynthSound } from "./landing/sound";
import { TiltCard } from "./landing/TiltCard";
import { SignIn } from "./SignIn";

function LegalText({ paragraphs }: { paragraphs: string[] }) {
	return (
		<>
			{paragraphs.map((paragraph, index) => {
				if (index === 0) {
					return (
						<p key={paragraph}>
							<strong>{paragraph}</strong>
						</p>
					);
				}
				const match = paragraph.match(/^(\d+\.\s*[^:]+)(?::)?(.*)$/);
				if (match) {
					return (
						<React.Fragment key={paragraph}>
							<h4 style={{ color: "var(--text-primary)", marginTop: 10 }}>
								{match[1]}
							</h4>
							{match[2] && <p>{match[2].trim()}</p>}
						</React.Fragment>
					);
				}
				return <p key={paragraph}>{paragraph}</p>;
			})}
		</>
	);
}

interface LandingHeaderProps {
	t: TranslationSchema;
	onSignIn: () => void;
}

function LandingHeader({ t, onSignIn }: LandingHeaderProps) {
	return (
		<header className="lp-header">
			<div className="lp-logo-container">
				<span>📚 {t.auth.copyright}</span>
				<span className="lp-logo-badge">V2.0</span>
			</div>
			<nav className="lp-nav">
				<a className="lp-nav-link" href="#features">
					{t.landingPage.navFeatures}
				</a>
				<a className="lp-nav-link" href="#playground">
					{t.landingPage.navInteractiveDemo}
				</a>
				<button
					type="button"
					id="lp-nav-signin-btn"
					className="btn btn-secondary btn-sm"
					style={{ borderRadius: "var(--radius-md)" }}
					onClick={onSignIn}
				>
					{t.landingPage.signInBtn}
				</button>
			</nav>
		</header>
	);
}

interface LandingHeroProps {
	t: TranslationSchema;
	onGetStarted: () => void;
}

function LandingHero({ t, onGetStarted }: LandingHeroProps) {
	return (
		<section className="lp-hero">
			<h1>
				<span className="lp-title-sans">{t.landingPage.heroTitleLine1}</span>
				<br />
				<span className="lp-title-sans">{t.landingPage.heroTitleLine2}</span>
				<span className="lp-gradient-accent lp-title-serif">
					{t.landingPage.heroTitleAccent}
				</span>
			</h1>

			<p className="lp-hero-desc">{t.landingPage.tagline}</p>

			<div className="lp-cta-group">
				<button
					type="button"
					id="lp-hero-getstarted-btn"
					className="btn lp-btn lp-btn-primary"
					onClick={onGetStarted}
				>
					{t.landingPage.ctaBtn} →
				</button>
				<a href="#playground" className="btn lp-btn lp-btn-outline">
					{t.landingPage.liveSandboxBtn}
				</a>
			</div>

			{/* Floating App Mock Elements */}
			<div className="lp-hero-visual">
				<div className="lp-floating-card lp-fc-1">
					<div className="lp-fc-header">
						<span>🎯 {t.dashboard.upcomingExams}</span>
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								fontSize: "0.82rem",
							}}
						>
							<span style={{ fontWeight: 600 }}>
								🧮 {t.landingPage.mockCalculusExam}
							</span>
							<span style={{ color: "var(--danger)", fontWeight: 700 }}>
								{t.landingPage.examDueIn(t.exams.daysCount(2))}
							</span>
						</div>
						<div
							style={{
								height: 4,
								background: "rgba(255, 255, 255, 0.05)",
								borderRadius: 2,
							}}
						>
							<div
								style={{
									width: "85%",
									height: "100%",
									background: "var(--danger)",
									borderRadius: 2,
								}}
							/>
						</div>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								fontSize: "0.82rem",
								marginTop: 4,
							}}
						>
							<span style={{ fontWeight: 600 }}>
								🧪 {t.landingPage.mockChemistryExam}
							</span>
							<span style={{ color: "var(--warning)", fontWeight: 700 }}>
								{t.landingPage.examDueIn(t.exams.daysCount(5))}
							</span>
						</div>
						<div
							style={{
								height: 4,
								background: "rgba(255, 255, 255, 0.05)",
								borderRadius: 2,
							}}
						>
							<div
								style={{
									width: "40%",
									height: "100%",
									background: "var(--warning)",
									borderRadius: 2,
								}}
							/>
						</div>
					</div>
				</div>

				<div className="lp-floating-card lp-fc-2">
					<div className="lp-fc-header">
						<span>👥 {t.sidebar.friends}</span>
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 10,
							fontSize: "0.82rem",
						}}
					>
						<div className="lp-avatar">A</div>
						<div style={{ flex: 1 }}>
							<div style={{ fontWeight: 600, color: "#fff" }}>
								Alice ({t.landingPage.mockFriendStatus})
							</div>
							<div style={{ fontSize: "0.75rem", color: "#10b981" }}>
								{t.landingPage.mockFriendActivity}
							</div>
						</div>
						<span style={{ fontSize: "1.1rem" }}>
							⚡ 5{t.landingPage.mockStreakShortUnit}
						</span>
					</div>
				</div>

				<div className="lp-floating-card lp-fc-3">
					<div
						className="lp-fc-header"
						style={{ display: "flex", justifyContent: "space-between" }}
					>
						<span>🔥 {t.dashboard.studyStreak}</span>
						<span style={{ color: "#f59e0b", fontWeight: 700 }}>
							{t.landingPage.mockPlannerLevel}
						</span>
					</div>
					<div className="lp-fc-streak">
						<span className="lp-streak-num">
							05 <span>{t.landingPage.daysUnit}</span>
						</span>
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
	);
}

function TimetableMock() {
	return (
		<div className="lp-mock-calendar">
			<div className="lp-mock-cal-header">
				<span style={{ fontWeight: 700 }}>📅 November 2026</span>
				<span style={{ fontSize: "0.75rem", opacity: 0.6 }}>Week View</span>
			</div>
			<div className="lp-mock-cal-grid">
				<div className="lp-mock-cal-day">
					<span className="lp-mock-cal-day-label">Mon</span>
					<div className="lp-mock-cal-event blue">
						<div style={{ fontWeight: 700 }}>Math II</div>
						<div style={{ fontSize: "0.75rem", opacity: 0.8 }}>10:00</div>
					</div>
				</div>
				<div className="lp-mock-cal-day">
					<span className="lp-mock-cal-day-label">Tue</span>
					<div className="lp-mock-cal-event red">
						<div style={{ fontWeight: 700 }}>Calculus</div>
						<div style={{ fontSize: "0.75rem", opacity: 0.8 }}>09:00</div>
					</div>
				</div>
				<div className="lp-mock-cal-day">
					<span className="lp-mock-cal-day-label">Wed</span>
					<div className="lp-mock-cal-event green">
						<div style={{ fontWeight: 700 }}>Group</div>
						<div style={{ fontSize: "0.75rem", opacity: 0.8 }}>13:00</div>
					</div>
				</div>
				<div className="lp-mock-cal-day">
					<span className="lp-mock-cal-day-label">Thu</span>
					<div className="lp-mock-cal-event blue">
						<div style={{ fontWeight: 700 }}>Math II</div>
						<div style={{ fontSize: "0.75rem", opacity: 0.8 }}>10:00</div>
					</div>
				</div>
				<div className="lp-mock-cal-day">
					<span className="lp-mock-cal-day-label">Fri</span>
					<div className="lp-mock-cal-event purple">
						<div style={{ fontWeight: 700 }}>Review</div>
						<div style={{ fontSize: "0.75rem", opacity: 0.8 }}>15:00</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function PomodoroMock() {
	return (
		<div className="lp-mock-pomo">
			<div className="lp-mock-pomo-circle">
				<div className="lp-mock-pomo-spinner" />
				<span className="lp-mock-pomo-time">18:42</span>
				<span className="lp-mock-pomo-status">Focusing</span>
			</div>
			<div className="lp-mock-pomo-controls">
				<span
					style={{
						fontSize: "0.8rem",
						color: "#a1a1aa",
						fontWeight: 600,
					}}
				>
					💻 Current: Calculus review
				</span>
				<div className="lp-mock-pomo-btn-group">
					<button
						type="button"
						className="btn btn-sm"
						style={{
							background: "rgba(239, 68, 68, 0.2)",
							color: "#ef4444",
							border: "1px solid rgba(239, 68, 68, 0.4)",
							borderRadius: "var(--radius-md)",
						}}
					>
						⏸ Pause
					</button>
					<button
						type="button"
						className="btn btn-sm"
						style={{
							background: "rgba(255, 255, 255, 0.03)",
							border: "1px solid rgba(255, 255, 255, 0.08)",
							color: "#e4e4e7",
							borderRadius: "var(--radius-md)",
						}}
					>
						Stop
					</button>
				</div>
			</div>
		</div>
	);
}

function ChatMock() {
	return (
		<div className="lp-mock-chat">
			<div className="lp-mock-chat-bubble sent">
				<div
					style={{
						fontWeight: 700,
						fontSize: "0.75rem",
						marginBottom: 2,
						color: "#94a3b8",
					}}
				>
					@alice
				</div>
				Did you get the chemistry formula document?
			</div>
			<div className="lp-mock-chat-secure-badge">
				<span>🔒 Secured with Client-Side E2EE Cryptography</span>
			</div>
			<div className="lp-mock-chat-bubble received">
				<div
					style={{
						fontWeight: 700,
						fontSize: "0.75rem",
						marginBottom: 2,
						color: "#34d399",
					}}
				>
					@bob
				</div>
				Yes, decrypting chemistry_prep.pdf with my private key… ✓
			</div>
		</div>
	);
}

function AnalyticsMock() {
	return (
		<div className="lp-mock-analytics">
			<div className="lp-mock-analytics-row">
				<div className="lp-mock-analytics-stat">
					<span className="lp-mock-analytics-value">24.5h</span>
					<span className="lp-mock-analytics-label">Study Time</span>
				</div>
				<div className="lp-mock-analytics-stat">
					<span
						className="lp-mock-analytics-value"
						style={{ color: "#f59e0b" }}
					>
						6d 🔥
					</span>
					<span className="lp-mock-analytics-label">Streak</span>
				</div>
				<div className="lp-mock-analytics-stat">
					<span className="lp-mock-analytics-value">5/5</span>
					<span className="lp-mock-analytics-label">Badges</span>
				</div>
			</div>
			<div className="lp-mock-chart-container">
				<div className="lp-mock-chart-bar" style={{ height: "40%" }} />
				<div className="lp-mock-chart-bar" style={{ height: "65%" }} />
				<div className="lp-mock-chart-bar" style={{ height: "30%" }} />
				<div className="lp-mock-chart-bar" style={{ height: "80%" }} />
				<div className="lp-mock-chart-bar" style={{ height: "95%" }} />
				<div className="lp-mock-chart-bar" style={{ height: "50%" }} />
			</div>
		</div>
	);
}

interface LandingFeaturesProps {
	t: TranslationSchema;
}

function LandingFeatures({ t }: LandingFeaturesProps) {
	return (
		<section id="features" className="lp-features">
			<div className="lp-section-header">
				<h2>{t.landingPage.featuresTitle}</h2>
				<p>{t.landingPage.featuresIntro}</p>
			</div>

			<div className="lp-features-list">
				{/* 1. Structured Timetable */}
				<div className="lp-feature-row">
					<ScrollReveal
						className="lp-feature-text-col"
						animation="fade-up"
						duration={700}
						delay={50}
					>
						<span className="lp-feature-num">01</span>
						<h3>{t.landingPage.structuredTimetableTitle}</h3>
						<p>{t.landingPage.structuredTimetableDesc}</p>
						<div className="lp-feature-highlights">
							<div className="lp-feature-highlight-item">
								<span
									className="lp-feature-highlight-bullet"
									style={{ background: "#3b82f6" }}
								/>
								<span>
									{t.landingPage.mockCalculusExam} &{" "}
									{t.landingPage.mockChemistryExam} calendars
								</span>
							</div>
							<div className="lp-feature-highlight-item">
								<span
									className="lp-feature-highlight-bullet"
									style={{ background: "#3b82f6" }}
								/>
								<span>Drag-and-drop lecture & exam event block scheduling</span>
							</div>
							<div className="lp-feature-highlight-item">
								<span
									className="lp-feature-highlight-bullet"
									style={{ background: "#3b82f6" }}
								/>
								<span>
									Real-time instant cloud synchronization across all screens
								</span>
							</div>
						</div>
					</ScrollReveal>
					<ScrollReveal
						className="lp-feature-visual-col"
						animation="scale"
						duration={850}
						delay={150}
					>
						<TiltCard className="lp-feature-visual-card" neonColor="#3b82f6">
							<TimetableMock />
						</TiltCard>
					</ScrollReveal>
				</div>

				{/* 2. Pomodoro Focus Engine */}
				<div className="lp-feature-row">
					<ScrollReveal
						className="lp-feature-text-col"
						animation="fade-up"
						duration={700}
						delay={50}
					>
						<span className="lp-feature-num">02</span>
						<h3>{t.pomodoro.title}</h3>
						<p>{t.landingPage.feature2Desc}</p>
						<div className="lp-feature-highlights">
							<div className="lp-feature-highlight-item">
								<span
									className="lp-feature-highlight-bullet"
									style={{ background: "#ef4444" }}
								/>
								<span>Customizable focus & rest interval configurations</span>
							</div>
							<div className="lp-feature-highlight-item">
								<span
									className="lp-feature-highlight-bullet"
									style={{ background: "#ef4444" }}
								/>
								<span>Directly log focus minutes to study history sheets</span>
							</div>
							<div className="lp-feature-highlight-item">
								<span
									className="lp-feature-highlight-bullet"
									style={{ background: "#ef4444" }}
								/>
								<span>Ambient notifications & sound cues to keep rhythm</span>
							</div>
						</div>
					</ScrollReveal>
					<ScrollReveal
						className="lp-feature-visual-col"
						animation="scale"
						duration={850}
						delay={150}
					>
						<TiltCard className="lp-feature-visual-card" neonColor="#ef4444">
							<PomodoroMock />
						</TiltCard>
					</ScrollReveal>
				</div>

				{/* 3. Encrypted Chat */}
				<div className="lp-feature-row">
					<ScrollReveal
						className="lp-feature-text-col"
						animation="fade-up"
						duration={700}
						delay={50}
					>
						<span className="lp-feature-num">03</span>
						<h3>{t.landingPage.encryptedChatTitle}</h3>
						<p>{t.landingPage.encryptedChatDesc}</p>
						<div className="lp-feature-highlights">
							<div className="lp-feature-highlight-item">
								<span
									className="lp-feature-highlight-bullet"
									style={{ background: "#10b981" }}
								/>
								<span>
									Client-side 2048-bit RSA keys generated in your browser
								</span>
							</div>
							<div className="lp-feature-highlight-item">
								<span
									className="lp-feature-highlight-bullet"
									style={{ background: "#10b981" }}
								/>
								<span>
									Secure key backups with Zero-Knowledge Escrow verification
								</span>
							</div>
							<div className="lp-feature-highlight-item">
								<span
									className="lp-feature-highlight-bullet"
									style={{ background: "#10b981" }}
								/>
								<span>Automatic chat message deletion after 72 hours</span>
							</div>
						</div>
					</ScrollReveal>
					<ScrollReveal
						className="lp-feature-visual-col"
						animation="scale"
						duration={850}
						delay={150}
					>
						<TiltCard className="lp-feature-visual-card" neonColor="#10b981">
							<ChatMock />
						</TiltCard>
					</ScrollReveal>
				</div>

				{/* 4. Academic Analytics */}
				<div className="lp-feature-row">
					<ScrollReveal
						className="lp-feature-text-col"
						animation="fade-up"
						duration={700}
						delay={50}
					>
						<span className="lp-feature-num">04</span>
						<h3>{t.landingPage.analyticsTitle}</h3>
						<p>{t.landingPage.feature4Desc}</p>
						<div className="lp-feature-highlights">
							<div className="lp-feature-highlight-item">
								<span
									className="lp-feature-highlight-bullet"
									style={{ background: "#f59e0b" }}
								/>
								<span>Subject-by-subject distribution analytics</span>
							</div>
							<div className="lp-feature-highlight-item">
								<span
									className="lp-feature-highlight-bullet"
									style={{ background: "#f59e0b" }}
								/>
								<span>Unlockable trophies & motivational badge progress</span>
							</div>
							<div className="lp-feature-highlight-item">
								<span
									className="lp-feature-highlight-bullet"
									style={{ background: "#f59e0b" }}
								/>
								<span>Weekly study hour progression metrics</span>
							</div>
						</div>
					</ScrollReveal>
					<ScrollReveal
						className="lp-feature-visual-col"
						animation="scale"
						duration={850}
						delay={150}
					>
						<TiltCard className="lp-feature-visual-card" neonColor="#f59e0b">
							<AnalyticsMock />
						</TiltCard>
					</ScrollReveal>
				</div>
			</div>
		</section>
	);
}

interface LandingPlaygroundProps {
	t: TranslationSchema;
}

function LandingPlayground({ t }: LandingPlaygroundProps) {
	return (
		<section id="playground" className="lp-workbench">
			<div className="lp-section-header">
				<h2>{t.landingPage.playgroundTitle}</h2>
				<p>{t.landingPage.playgroundDesc}</p>
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
	);
}

interface LandingCTAProps {
	t: TranslationSchema;
	onGetStarted: () => void;
}

function LandingCTA({ t, onGetStarted }: LandingCTAProps) {
	return (
		<section className="lp-cta-section">
			<h2>{t.landingPage.ctaTitle}</h2>
			<p>{t.landingPage.ctaDesc}</p>
			<button
				type="button"
				className="lp-btn lp-btn-primary"
				onClick={onGetStarted}
			>
				{t.landingPage.ctaBtn}
			</button>
		</section>
	);
}

interface LandingFooterProps {
	t: TranslationSchema;
	onShowLegal: (type: "privacy" | "terms") => void;
}

function LandingFooter({ t, onShowLegal }: LandingFooterProps) {
	return (
		<footer className="lp-footer">
			<div suppressHydrationWarning>
				© {new Date().getFullYear()} {t.auth.copyright}.{" "}
				{t.landingPage.footerText}
			</div>
			<div className="lp-footer-links">
				<a className="lp-footer-link" href="#features">
					{t.landingPage.navFeatures}
				</a>
				<a className="lp-footer-link" href="#playground">
					{t.landingPage.navInteractiveSandbox}
				</a>
				<span style={{ color: "rgba(255,255,255,0.05)" }}>•</span>
				<button
					type="button"
					className="lp-footer-link"
					style={{
						background: "none",
						border: "none",
						font: "inherit",
						cursor: "pointer",
						padding: 0,
					}}
					onClick={() => {
						playSynthSound("click");
						onShowLegal("privacy");
					}}
				>
					{t.settings.privacyBtn}
				</button>
				<span style={{ color: "rgba(255,255,255,0.05)" }}>•</span>
				<button
					type="button"
					className="lp-footer-link"
					style={{
						background: "none",
						border: "none",
						font: "inherit",
						cursor: "pointer",
						padding: 0,
					}}
					onClick={() => {
						playSynthSound("click");
						onShowLegal("terms");
					}}
				>
					{t.settings.termsBtn}
				</button>
				<span style={{ color: "rgba(255,255,255,0.05)" }}>•</span>
				<span style={{ color: "#71717a" }}>{t.landingPage.footerConvex}</span>
			</div>
		</footer>
	);
}

export function LandingPage() {
	const { t } = useLanguage();
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [showLegal, setShowLegal] = useState<"privacy" | "terms" | null>(null);

	// SEO Updates
	useEffect(() => {
		document.title = t.landingPage.seoTitle;
		const metaDesc = document.querySelector('meta[name="description"]');
		if (metaDesc) {
			metaDesc.setAttribute("content", t.landingPage.seoDesc);
		}
	}, [t.landingPage.seoDesc, t.landingPage.seoTitle]);

	const handleOpenAuth = () => {
		playSynthSound("click");
		setShowAuthModal(true);
	};

	return (
		<div className="lp-wrapper">
			{/* Background blurs */}
			<div className="lp-glow" />
			<div className="lp-glow-secondary" />

			<LandingHeader t={t} onSignIn={handleOpenAuth} />
			<LandingHero t={t} onGetStarted={handleOpenAuth} />
			<LandingFeatures t={t} />
			<LandingPlayground t={t} />
			<LandingCTA t={t} onGetStarted={handleOpenAuth} />
			<LandingFooter t={t} onShowLegal={setShowLegal} />

			{/* Backdrop blur Auth Modal */}
			{showAuthModal && (
				<Modal title={t.auth.signInBtn} onClose={() => setShowAuthModal(false)}>
					<SignIn />
				</Modal>
			)}

			{showLegal === "privacy" && (
				<Modal
					title={t.settings.privacyPolicyTitle}
					onClose={() => setShowLegal(null)}
				>
					<div
						style={{
							fontSize: "0.85rem",
							lineHeight: "1.5",
							color: "var(--text-secondary)",
							display: "flex",
							flexDirection: "column",
							gap: 12,
						}}
					>
						<LegalText paragraphs={t.settings.privacyPolicyText} />
					</div>
				</Modal>
			)}

			{showLegal === "terms" && (
				<Modal
					title={t.settings.termsOfServiceTitle}
					onClose={() => setShowLegal(null)}
				>
					<div
						style={{
							fontSize: "0.85rem",
							lineHeight: "1.5",
							color: "var(--text-secondary)",
							display: "flex",
							flexDirection: "column",
							gap: 12,
						}}
					>
						<LegalText paragraphs={t.settings.termsOfServiceText} />
					</div>
				</Modal>
			)}
		</div>
	);
}
