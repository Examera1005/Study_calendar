import type React from "react";
import { useLanguage } from "../../hooks/useLanguage";

interface ManageFriendsTabProps {
	searchQuery: string;
	setSearchQuery: (v: string) => void;
	handleSendRequest: (e: React.FormEvent) => void;
	requestError: string;
	requestSuccess: string;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	searchResults: any[] | undefined;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	friendships: any;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	handleRespond: (friendshipId: any, action: "accept" | "reject") => void;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	setViewExamsFriend: (f: any) => void;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	setActiveChatFriend: (f: any) => void;
	setActiveTab: (tab: "leaderboard" | "chat" | "manage") => void;
	handleBlockFriend: (blockedUserId: string, username: string) => void;
}

interface SearchFriendsCardProps {
	searchQuery: string;
	setSearchQuery: (v: string) => void;
	handleSendRequest: (e: React.FormEvent) => void;
	requestError: string;
	requestSuccess: string;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	searchResults: any[] | undefined;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	t: any;
}

function SearchFriendsCard({
	searchQuery,
	setSearchQuery,
	handleSendRequest,
	requestError,
	requestSuccess,
	searchResults,
	t,
}: SearchFriendsCardProps) {
	return (
		<div className="card">
			<h3>{t.friends.searchFriendsHeader}</h3>
			<p
				style={{
					fontSize: "0.8rem",
					color: "var(--text-muted)",
					marginBottom: 16,
				}}
			>
				{t.friends.searchFriendsDesc}
			</p>

			<form
				onSubmit={handleSendRequest}
				style={{ display: "flex", gap: 10, marginBottom: 16 }}
			>
				<input
					type="text"
					placeholder={t.friends.searchFriendsPlaceholder}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					aria-label={t.friends.searchFriendsPlaceholder}
					style={{
						flex: 1,
						padding: "8px 12px",
						border: "1px solid var(--border-subtle)",
						borderRadius: "var(--radius-md)",
						background: "var(--bg-primary)",
						color: "var(--text-primary)",
					}}
					required
				/>
				<button type="submit" className="btn btn-primary">
					{t.friends.sendInviteBtn}
				</button>
			</form>

			{requestError && (
				<div className="error-msg" style={{ fontSize: "0.8rem" }}>
					{requestError}
				</div>
			)}
			{requestSuccess && (
				<div
					style={{
						color: "var(--success)",
						fontSize: "0.8rem",
						fontWeight: 500,
					}}
				>
					{requestSuccess}
				</div>
			)}

			{searchResults && searchResults.length > 0 && (
				<div style={{ marginTop: 12 }}>
					<div
						style={{
							fontSize: "0.75rem",
							color: "var(--text-muted)",
							marginBottom: 8,
						}}
					>
						{t.friends.matchingHandles}
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
						{/** biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type */}
						{searchResults.map((user: any) => (
							<div
								key={user.userId}
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									padding: "8px 12px",
									background: "var(--bg-primary)",
									borderRadius: "var(--radius-md)",
									border: "1px solid var(--border-subtle)",
								}}
							>
								<span style={{ fontWeight: 600 }}>{user.username}</span>
								<button
									type="button"
									className="btn btn-secondary btn-sm"
									onClick={() => {
										setSearchQuery(user.username);
									}}
								>
									{t.common.select}
								</button>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

interface PendingInvitesCardProps {
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	friendships: any;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	handleRespond: (friendshipId: any, action: "accept" | "reject") => void;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	t: any;
}

function PendingInvitesCard({
	friendships,
	handleRespond,
	t,
}: PendingInvitesCardProps) {
	return (
		<div className="card">
			<h3>{t.friends.pendingInvitesHeader}</h3>

			<div style={{ marginTop: 12 }}>
				<h4
					style={{
						fontSize: "0.8rem",
						color: "var(--text-muted)",
						marginBottom: 8,
					}}
				>
					{t.friends.pendingIncoming}
				</h4>
				{friendships?.pendingReceived &&
				friendships.pendingReceived.length > 0 ? (
					<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
						{/** biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type */}
						{friendships.pendingReceived.map((req: any) => (
							<div
								key={req.friendshipId}
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									padding: "8px 12px",
									background: "var(--bg-primary)",
									borderRadius: "var(--radius-md)",
									border: "1px solid var(--border-subtle)",
								}}
							>
								<span style={{ fontWeight: 600 }}>{req.username}</span>
								<div style={{ display: "flex", gap: 6 }}>
									<button
										type="button"
										className="btn btn-primary btn-sm"
										onClick={() => handleRespond(req.friendshipId, "accept")}
									>
										{t.friends.acceptBtn}
									</button>
									<button
										type="button"
										className="btn btn-secondary btn-sm"
										onClick={() => handleRespond(req.friendshipId, "reject")}
									>
										{t.friends.declineBtn}
									</button>
								</div>
							</div>
						))}
					</div>
				) : (
					<div
						style={{
							fontSize: "0.78rem",
							color: "var(--text-muted)",
							padding: 6,
						}}
					>
						{t.friends.noIncomingRequests}
					</div>
				)}
			</div>

			<div style={{ marginTop: 20 }}>
				<h4
					style={{
						fontSize: "0.8rem",
						color: "var(--text-muted)",
						marginBottom: 8,
					}}
				>
					{t.friends.pendingOutgoing}
				</h4>
				{friendships?.pendingSent && friendships.pendingSent.length > 0 ? (
					<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
						{/** biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type */}
						{friendships.pendingSent.map((req: any) => (
							<div
								key={req.friendshipId}
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									padding: "8px 12px",
									background: "var(--bg-primary)",
									borderRadius: "var(--radius-md)",
									border: "1px solid var(--border-subtle)",
								}}
							>
								<span>{req.username}</span>
								<button
									type="button"
									className="btn btn-secondary btn-sm"
									onClick={() => handleRespond(req.friendshipId, "reject")}
								>
									{t.common.cancel}
								</button>
							</div>
						))}
					</div>
				) : (
					<div
						style={{
							fontSize: "0.78rem",
							color: "var(--text-muted)",
							padding: 6,
						}}
					>
						{t.friends.noSentInvites}
					</div>
				)}
			</div>
		</div>
	);
}

interface AcceptedFriendsCardProps {
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	friendships: any;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	setViewExamsFriend: (f: any) => void;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	setActiveChatFriend: (f: any) => void;
	setActiveTab: (tab: "leaderboard" | "chat" | "manage") => void;
	handleBlockFriend: (blockedUserId: string, username: string) => void;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	t: any;
}

function AcceptedFriendsCard({
	friendships,
	setViewExamsFriend,
	setActiveChatFriend,
	setActiveTab,
	handleBlockFriend,
	t,
}: AcceptedFriendsCardProps) {
	return (
		<div className="card">
			<h3>{t.friends.acceptedFriendsHeader}</h3>
			<p
				style={{
					fontSize: "0.8rem",
					color: "var(--text-muted)",
					marginBottom: 20,
				}}
			>
				{t.friends.acceptedFriendsDesc}
			</p>

			<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
				{friendships?.accepted && friendships.accepted.length > 0 ? (
					// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
					friendships.accepted.map((friend: any) => (
						<div key={friend.userId} className="friend-row-card">
							<div style={{ minWidth: 150 }}>
								<div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
									{friend.username}
								</div>
								<div
									style={{
										fontSize: "0.75rem",
										color: "var(--text-muted)",
										marginTop: 4,
									}}
								>
									{t.friends.e2eActive}
								</div>
							</div>
							<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
								<button
									type="button"
									className="btn btn-secondary btn-sm"
									onClick={() => setViewExamsFriend(friend)}
								>
									{t.friends.viewExamsBtn}
								</button>
								<button
									type="button"
									className="btn btn-primary btn-sm"
									onClick={() => {
										setActiveChatFriend(friend);
										setActiveTab("chat");
									}}
								>
									{t.friends.chatTab}
								</button>
								<button
									type="button"
									className="btn btn-danger btn-sm"
									onClick={() =>
										handleBlockFriend(friend.userId, friend.username)
									}
								>
									🚫 {t.friends.blockUserBtn}
								</button>
							</div>
						</div>
					))
				) : (
					<div
						style={{
							textAlign: "center",
							padding: 30,
							color: "var(--text-muted)",
							fontSize: "0.85rem",
						}}
					>
						{t.friends.noFriendsYet}
					</div>
				)}
			</div>
		</div>
	);
}

export function ManageFriendsTab({
	searchQuery,
	setSearchQuery,
	handleSendRequest,
	requestError,
	requestSuccess,
	searchResults,
	friendships,
	handleRespond,
	setViewExamsFriend,
	setActiveChatFriend,
	setActiveTab,
	handleBlockFriend,
}: ManageFriendsTabProps) {
	const { t } = useLanguage();

	return (
		<div className="friends-manage-grid">
			{/* Column A: Search & Request */}
			<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
				<SearchFriendsCard
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					handleSendRequest={handleSendRequest}
					requestError={requestError}
					requestSuccess={requestSuccess}
					searchResults={searchResults}
					t={t}
				/>

				<PendingInvitesCard
					friendships={friendships}
					handleRespond={handleRespond}
					t={t}
				/>
			</div>

			{/* Column B: Friends List */}
			<AcceptedFriendsCard
				friendships={friendships}
				setViewExamsFriend={setViewExamsFriend}
				setActiveChatFriend={setActiveChatFriend}
				setActiveTab={setActiveTab}
				handleBlockFriend={handleBlockFriend}
				t={t}
			/>
		</div>
	);
}
