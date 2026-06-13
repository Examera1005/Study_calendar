import type React from "react";
import { useEffect, useState } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import { decryptMessage } from "../../utils/crypto";

// Sub-component for decrypting message rows asynchronously
function ChatMessageRow({
	encryptedBody,
	senderEncryptedBody,
	isMe,
	timestamp,
}: {
	encryptedBody: string;
	senderEncryptedBody: string;
	isMe: boolean;
	timestamp: number;
}) {
	const { t } = useLanguage();
	const [body, setBody] = useState<string>(t.friends.decrypting);

	useEffect(() => {
		let active = true;
		async function decrypt() {
			try {
				const ciphertext = isMe ? senderEncryptedBody : encryptedBody;
				const decrypted = await decryptMessage(ciphertext);
				if (active) {
					setBody(decrypted);
				}
			} catch (error) {
				console.error(error);
				if (active) {
					setBody(t.friends.decryptError);
				}
			}
		}
		void decrypt();
		return () => {
			active = false;
		};
	}, [encryptedBody, senderEncryptedBody, isMe, t.friends.decryptError]);

	return (
		<div className={`chat-message-row ${isMe ? "me" : "them"}`}>
			<div className="chat-message-bubble">
				<div>{body}</div>
				<span className="chat-message-time">
					{new Date(timestamp).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</span>
			</div>
		</div>
	);
}

interface ChatTabProps {
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	friendships: any;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	activeChatFriend: any;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	setActiveChatFriend: (f: any) => void;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	chatMessages: any[] | undefined;
	chatInput: string;
	setChatInput: (v: string) => void;
	handleSendMessage: (e: React.FormEvent) => void;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	profile: any;
	chatBottomRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatTab({
	friendships,
	activeChatFriend,
	setActiveChatFriend,
	chatMessages,
	chatInput,
	setChatInput,
	handleSendMessage,
	profile,
	chatBottomRef,
}: ChatTabProps) {
	const { t } = useLanguage();

	return (
		<div className="friends-layout">
			{/* Active conversations / Friends list */}
			<div
				className={`card conversations-list-card ${activeChatFriend ? "has-active-chat" : ""}`}
				style={{ padding: 12 }}
			>
				<h3
					style={{
						padding: "8px 12px",
						borderBottom: "1px solid var(--border-subtle)",
						paddingBottom: 12,
						marginBottom: 8,
					}}
				>
					{t.friends.conversationsHeader}
				</h3>
				<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
					{friendships?.accepted && friendships.accepted.length > 0 ? (
						// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
						friendships.accepted.map((friend: any) => (
							<button
								key={friend.userId}
								type="button"
								className={`nav-item ${activeChatFriend?.userId === friend.userId ? "active" : ""}`}
								onClick={() => setActiveChatFriend(friend)}
								style={{
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<span>💬 {friend.username}</span>
								{friend.unreadCount > 0 && (
									<span className="chat-unread-badge">
										{friend.unreadCount}
									</span>
								)}
							</button>
						))
					) : (
						<div
							style={{
								textAlign: "center",
								padding: 16,
								fontSize: "0.8rem",
								color: "var(--text-muted)",
							}}
						>
							{t.friends.noConversations}
						</div>
					)}
				</div>
			</div>

			{/* Chat Window */}
			<div
				className={`chat-window ${activeChatFriend ? "has-active-chat" : ""}`}
			>
				{activeChatFriend ? (
					<>
						<div className="chat-header">
							<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
								<button
									type="button"
									className="mobile-back-btn"
									onClick={() => setActiveChatFriend(null)}
									aria-label={t.friends.backToConversations}
								>
									⬅️
								</button>
								<div>
									<h3
										style={{
											fontSize: "1.05rem",
											color: "var(--text-primary)",
											margin: 0,
										}}
									>
										{activeChatFriend.username}
									</h3>
									<span
										style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
									>
										{t.friends.activeConversation}
									</span>
								</div>
							</div>
							<div
								style={{
									fontSize: "0.75rem",
									color: "var(--success)",
									display: "flex",
									alignItems: "center",
									gap: 6,
								}}
							>
								<span
									className="pulse-dot"
									style={{
										width: 6,
										height: 6,
										background: "var(--success)",
										borderRadius: "50%",
									}}
								/>
								{t.friends.e2eLocked}
							</div>
						</div>

						<div
							style={{
								padding: "8px 16px",
								background: "var(--bg-elevated)",
								borderBottom: "1px solid var(--border-subtle)",
								fontSize: "0.78rem",
								color: "var(--text-muted)",
								textAlign: "center",
							}}
						>
							{t.friends.messagesDeletedNotice}
						</div>

						<div className="chat-messages">
							{chatMessages && chatMessages.length > 0 ? (
								// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
								chatMessages.map((msg: any) => (
									<ChatMessageRow
										key={msg._id}
										encryptedBody={msg.encryptedBody}
										senderEncryptedBody={msg.senderEncryptedBody}
										isMe={msg.senderId === profile.userId}
										timestamp={msg.timestamp}
									/>
								))
							) : (
								<div className="chat-empty">
									<span>{t.friends.e2eNotice}</span>
									<span style={{ fontSize: "0.8rem" }}>
										{t.friends.sayHello}
									</span>
								</div>
							)}
							<div ref={chatBottomRef} />
						</div>

						<form onSubmit={handleSendMessage} className="chat-input-area">
							<input
								type="text"
								placeholder={t.friends.typingPlaceholder}
								value={chatInput}
								onChange={(e) => setChatInput(e.target.value)}
								aria-label={t.friends.typingPlaceholder}
								required
							/>
							<button type="submit" className="btn btn-primary">
								{t.common.send}
							</button>
						</form>
					</>
				) : (
					<div className="chat-empty">
						<h3>{t.friends.chatTab}</h3>
						<p style={{ fontSize: "0.82rem" }}>{t.friends.emptyChatState}</p>
					</div>
				)}
			</div>
		</div>
	);
}
