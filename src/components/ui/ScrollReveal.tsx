import type React from "react";
import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
	children: React.ReactNode;
	className?: string;
	animation?:
		| "fade"
		| "fade-up"
		| "fade-down"
		| "fade-left"
		| "fade-right"
		| "scale";
	duration?: number;
	delay?: number;
	threshold?: number;
}

export function ScrollReveal({
	children,
	className = "",
	animation = "fade-up",
	duration = 800,
	delay = 0,
	threshold = 0.15,
}: ScrollRevealProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(() => {
		if (typeof window !== "undefined") {
			return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		}
		return false;
	});

	const thresholdRef = useRef(threshold);
	useEffect(() => {
		thresholdRef.current = threshold;
	}, [threshold]);

	const [dummy] = useState(0);

	useEffect(() => {
		if (dummy === -1) return;
		if (
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				setIsVisible(entry.isIntersecting);
			},
			{ threshold: thresholdRef.current },
		);

		const currentRef = ref.current;
		if (currentRef) {
			observer.observe(currentRef);
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef);
			}
		};
	}, [dummy]);

	const getInitialStyle = (): React.CSSProperties => {
		const transition = `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;

		if (isVisible) {
			return {
				opacity: 1,
				transform: "translate3d(0, 0, 0) scale(1)",
				transition,
			};
		}

		let transform = "translate3d(0, 0, 0) scale(1)";
		switch (animation) {
			case "fade-up":
				transform = "translate3d(0, 30px, 0)";
				break;
			case "fade-down":
				transform = "translate3d(0, -30px, 0)";
				break;
			case "fade-left":
				transform = "translate3d(30px, 0, 0)";
				break;
			case "fade-right":
				transform = "translate3d(-30px, 0, 0)";
				break;
			case "scale":
				transform = "scale(0.96)";
				break;
		}

		return {
			opacity: 0,
			transform,
			transition,
		};
	};

	return (
		<div ref={ref} className={className} style={getInitialStyle()}>
			{children}
		</div>
	);
}
