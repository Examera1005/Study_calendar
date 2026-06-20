import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LanguageProvider } from "./hooks/useLanguage";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

if (!convexUrl) {
	ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
		<div
			style={{
				padding: "40px",
				fontFamily: "sans-serif",
				color: "white",
				background: "#1a1a1a",
				height: "100vh",
			}}
		>
			<h2>Missing Environment Variable</h2>
			<p>
				The <code>VITE_CONVEX_URL</code> environment variable is missing.
			</p>
			<p>
				If you are on Vercel, please ensure it is added in{" "}
				<b>Settings &gt; Environment Variables</b> and that you have triggered a{" "}
				<b>Redeploy</b>.
			</p>
		</div>,
	);
} else {
	const convex = new ConvexReactClient(convexUrl);

	ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
		<React.StrictMode>
			<ConvexAuthProvider client={convex}>
				<LanguageProvider>
					<App />
				</LanguageProvider>
			</ConvexAuthProvider>
		</React.StrictMode>,
	);
}

if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker.register("/sw.js").catch((err) => {
			console.error("SW registration failed: ", err);
		});
	});
}
