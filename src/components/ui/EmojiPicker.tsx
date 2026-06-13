import { useEffect, useRef, useState } from "react";

const EMOJI_CATEGORIES = [
	{
		name: "Study",
		emojis: ["📚", "📝", "✏️", "🖋️", "🎓", "📓", "📖", "🎒", "🏫"],
	},
	{
		name: "Math & Science",
		emojis: ["📐", "📏", "🔬", "🧪", "🧬", "💻", "🧠", "🔭", "🧮", "🔢"],
	},
	{
		name: "Arts & Culture",
		emojis: ["🎨", "🎭", "🎸", "🎹", "🗣️", "♟️", "🌍", "🗺️", "🏛️"],
	},
	{
		name: "Goals & Status",
		emojis: ["🎯", "⏰", "📅", "🔥", "🏆", "⭐", "💡", "📢", "🔑"],
	},
];

type Props = {
	value: string;
	onChange: (val: string) => void;
	placeholder?: string;
	id?: string;
};

export function EmojiPicker({
	value,
	onChange,
	placeholder = "📐",
	id,
}: Props) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div ref={containerRef} style={{ position: "relative", width: "100%" }}>
			<div style={{ display: "flex", gap: 8 }}>
				<button
					type="button"
					className="btn btn-secondary emoji-select-btn"
					onClick={() => setIsOpen(!isOpen)}
					title="Choose emoji"
				>
					{value || <span style={{ opacity: 0.45 }}>{placeholder}</span>}
				</button>
				<input
					id={id}
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value.substring(0, 4))}
					placeholder={`Optional (e.g. ${placeholder})`}
					style={{ flex: 1 }}
					maxLength={4}
					aria-label="Selected emoji icon"
				/>
				{value && (
					<button
						type="button"
						className="btn btn-secondary btn-sm"
						onClick={() => onChange("")}
						style={{ padding: "0 10px", fontSize: "0.75rem" }}
					>
						Clear
					</button>
				)}
			</div>

			{isOpen && (
				<div className="emoji-picker-dropdown">
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: 10,
						}}
					>
						<span className="emoji-picker-header-title">Quick Select</span>
						{value && (
							<button
								type="button"
								className="btn btn-ghost btn-sm"
								onClick={() => {
									onChange("");
									setIsOpen(false);
								}}
								style={{ fontSize: "0.75rem", padding: "2px 6px" }}
							>
								Clear Selection
							</button>
						)}
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
						{EMOJI_CATEGORIES.map((cat) => (
							<div key={cat.name}>
								<div className="emoji-picker-cat-title">{cat.name}</div>
								<div className="emoji-picker-grid">
									{cat.emojis.map((emoji) => (
										<button
											key={emoji}
											type="button"
											onClick={() => {
												onChange(emoji);
												setIsOpen(false);
											}}
											className={`emoji-option-btn ${value === emoji ? "selected" : ""}`}
										>
											{emoji}
										</button>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
