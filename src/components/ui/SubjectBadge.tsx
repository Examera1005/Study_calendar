import type React from "react";

function getContrastColor(hexColor: string): "#ffffff" | "#000000" {
	const hex = hexColor.replace("#", "");
	if (hex.length !== 6) return "#ffffff";
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);
	const yiq = (r * 299 + g * 587 + b * 114) / 1000;
	return yiq >= 140 ? "#000000" : "#ffffff";
}

export function SubjectBadge({
	name,
	color,
	icon,
	style,
}: {
	name: string;
	color: string;
	icon?: string;
	style?: React.CSSProperties;
}) {
	const textColor = getContrastColor(color);
	return (
		<span
			className="subject-badge"
			style={{
				background: color,
				color: textColor,
				fontWeight: 600,
				...style,
			}}
		>
			{icon && <span style={{ marginRight: 4 }}>{icon}</span>}
			{name}
		</span>
	);
}
