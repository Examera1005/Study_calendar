import { useMutation, useQuery } from "convex/react";
import type React from "react";
import { useEffect, useReducer, useRef } from "react";
import { api } from "../../convex/_generated/api";
import { ChatTab } from "../components/friends/ChatTab";
import { LeaderboardTab } from "../components/friends/LeaderboardTab";
import { ManageFriendsTab } from "../components/friends/ManageFriendsTab";
// Sub-components
import { ProfileSetup } from "../components/friends/ProfileSetup";
import { ViewExamsModal } from "../components/friends/ViewExamsModal";
import { useLanguage } from "../hooks/useLanguage";
import {
	encryptMessage,
	generateAndSaveKeys,
	hasPrivateKey,
} from "../utils/crypto";

interface FriendsState {
	activeTab: "leaderboard" | "chat" | "manage";
	usernameInput: string;
	isSubmittingProfile: boolean;
	profileError: string;
	searchQuery: string;
	requestError: string;
	requestSuccess: string;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	activeChatFriend: any | null;
	chatInput: string;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	viewExamsFriend: any | null;
	importSuccessId: string | null;
	keyRecovered: boolean;
}

type FriendsAction =
	| { type: "SET_ACTIVE_TAB"; payload: "leaderboard" | "chat" | "manage" }
	| { type: "SET_USERNAME_INPUT"; payload: string }
	| { type: "START_SUBMIT_PROFILE" }
	| { type: "SUBMIT_PROFILE_SUCCESS" }
	| { type: "SUBMIT_PROFILE_ERROR"; payload: string }
	| { type: "SET_SEARCH_QUERY"; payload: string }
	| { type: "SET_REQUEST_ERROR"; payload: string }
	| { type: "SET_REQUEST_SUCCESS"; payload: string }
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	| { type: "SET_ACTIVE_CHAT_FRIEND"; payload: any | null }
	| { type: "SET_CHAT_INPUT"; payload: string }
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	| { type: "SET_VIEW_EXAMS_FRIEND"; payload: any | null }
	| { type: "SET_IMPORT_SUCCESS_ID"; payload: string | null }
	| { type: "SET_KEY_RECOVERED"; payload: boolean };

const getInitialActiveTab = (): "leaderboard" | "chat" | "manage" => {
	if (typeof window !== "undefined") {
		const saved = localStorage.getItem("friendsActiveTab");
		if (saved === "leaderboard" || saved === "chat" || saved === "manage") {
			return saved;
		}
	}
	return "leaderboard";
};

const initialState: FriendsState = {
	activeTab: getInitialActiveTab(),
	usernameInput: "",
	isSubmittingProfile: false,
	profileError: "",
	searchQuery: "",
	requestError: "",
	requestSuccess: "",
	activeChatFriend: null,
	chatInput: "",
	viewExamsFriend: null,
	importSuccessId: null,
	keyRecovered: false,
};

function friendsReducer(
	state: FriendsState,
	action: FriendsAction,
): FriendsState {
	switch (action.type) {
		case "SET_ACTIVE_TAB":
			if (typeof window !== "undefined") {
				localStorage.setItem("friendsActiveTab", action.payload);
			}
			return { ...state, activeTab: action.payload };
		case "SET_USERNAME_INPUT":
			return { ...state, usernameInput: action.payload };
		case "START_SUBMIT_PROFILE":
			return { ...state, isSubmittingProfile: true, profileError: "" };
		case "SUBMIT_PROFILE_SUCCESS":
			return { ...state, isSubmittingProfile: false, profileError: "" };
		case "SUBMIT_PROFILE_ERROR":
			return {
				...state,
				isSubmittingProfile: false,
				profileError: action.payload,
			};
		case "SET_SEARCH_QUERY":
			return { ...state, searchQuery: action.payload };
		case "SET_REQUEST_ERROR":
			return { ...state, requestError: action.payload };
		case "SET_REQUEST_SUCCESS":
			return { ...state, requestSuccess: action.payload };
		case "SET_ACTIVE_CHAT_FRIEND":
			return { ...state, activeChatFriend: action.payload };
		case "SET_CHAT_INPUT":
			return { ...state, chatInput: action.payload };
		case "SET_VIEW_EXAMS_FRIEND":
			return { ...state, viewExamsFriend: action.payload };
		case "SET_IMPORT_SUCCESS_ID":
			return { ...state, importSuccessId: action.payload };
		case "SET_KEY_RECOVERED":
			return { ...state, keyRecovered: action.payload };
		default:
			return state;
	}
}

interface FriendsHeaderProps {
	// biome-ignore lint/suspicious/noExplicitAny: translations object
	t: any;
	keyRecovered: boolean;
	username: string;
}

function FriendsHeader({ t, keyRecovered, username }: FriendsHeaderProps) {
	return (
		<>
			{keyRecovered && (
				<div className="key-recovery-banner">
					<span style={{ fontSize: "1.2rem" }}>🔑</span>
					<span>{t.friends.keysRegenerated}</span>
				</div>
			)}
			<div className="page-header">
				<div>
					<h1>{t.friends.title}</h1>
					<div className="date-display">{t.friends.loggedInAs(username)}</div>
				</div>
			</div>
		</>
	);
}

interface FriendsNavigationTabsProps {
	// biome-ignore lint/suspicious/noExplicitAny: translations object
	t: any;
	activeTab: "leaderboard" | "chat" | "manage";
	totalUnreadMessages: number;
	setActiveTab: (tab: "leaderboard" | "chat" | "manage") => void;
}

function FriendsNavigationTabs({
	t,
	activeTab,
	totalUnreadMessages,
	setActiveTab,
}: FriendsNavigationTabsProps) {
	return (
		<div className="friends-nav-tabs">
			<button
				type="button"
				className={`friend-tab-btn ${activeTab === "leaderboard" ? "active" : ""}`}
				onClick={() => setActiveTab("leaderboard")}
			>
				{t.friends.leaderboardTab}
			</button>
			<button
				type="button"
				className={`friend-tab-btn ${activeTab === "chat" ? "active" : ""}`}
				onClick={() => setActiveTab("chat")}
				style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
			>
				{t.friends.chatTab}
				{totalUnreadMessages > 0 && (
					<span className="chat-tab-unread-badge">{totalUnreadMessages}</span>
				)}
			</button>
			<button
				type="button"
				className={`friend-tab-btn ${activeTab === "manage" ? "active" : ""}`}
				onClick={() => setActiveTab("manage")}
			>
				{t.friends.manageTab}
			</button>
		</div>
	);
}

interface UseFriendsActionsProps {
	// biome-ignore lint/suspicious/noExplicitAny: Convex mutation
	createProfile: any;
	// biome-ignore lint/suspicious/noExplicitAny: Convex mutation
	sendRequest: any;
	// biome-ignore lint/suspicious/noExplicitAny: Convex mutation
	respondRequest: any;
	// biome-ignore lint/suspicious/noExplicitAny: Convex mutation
	sendMessage: any;
	// biome-ignore lint/suspicious/noExplicitAny: Convex mutation
	importExam: any;
	// biome-ignore lint/suspicious/noExplicitAny: Convex mutation
	blockUser: any;
	dispatch: React.Dispatch<FriendsAction>;
	state: FriendsState;
	// biome-ignore lint/suspicious/noExplicitAny: profile state
	profile: any;
	// biome-ignore lint/suspicious/noExplicitAny: translations object
	t: any;
}

function useFriendsActions({
	createProfile,
	sendRequest,
	respondRequest,
	sendMessage,
	importExam,
	blockUser,
	dispatch,
	state,
	profile,
	t,
}: UseFriendsActionsProps) {
	const handleCreateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		dispatch({ type: "START_SUBMIT_PROFILE" });

		try {
			const pubKeyBase64 = await generateAndSaveKeys();
			await createProfile({
				username: state.usernameInput,
				publicKey: pubKeyBase64,
			} as any);
			dispatch({ type: "SUBMIT_PROFILE_SUCCESS" });
		} catch (err: any) {
			dispatch({
				type: "SUBMIT_PROFILE_ERROR",
				payload: err.message || t.friends.setupProfileError,
			});
		}
	};

	const handleSendRequest = async (e: React.FormEvent) => {
		e.preventDefault();
		dispatch({ type: "SET_REQUEST_ERROR", payload: "" });
		dispatch({ type: "SET_REQUEST_SUCCESS", payload: "" });
		try {
			await sendRequest({ username: state.searchQuery });
			dispatch({
				type: "SET_REQUEST_SUCCESS",
				payload: t.friends.friendRequestSent(state.searchQuery),
			});
			dispatch({ type: "SET_SEARCH_QUERY", payload: "" });
		} catch (err: any) {
			dispatch({
				type: "SET_REQUEST_ERROR",
				payload: err.message || "Failed to send request.",
			});
		}
	};

	const handleRespond = async (
		friendshipId: any,
		action: "accept" | "reject",
	) => {
		try {
			await respondRequest({ friendshipId, action });
		} catch (err: any) {
			alert(`${t.common.error}: ${err.message}`);
		}
	};

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!state.chatInput.trim() || !state.activeChatFriend) return;

		const messageText = state.chatInput.trim();
		dispatch({ type: "SET_CHAT_INPUT", payload: "" });

		try {
			const [receiverCiphertext, senderCiphertext] = await Promise.all([
				encryptMessage(messageText, state.activeChatFriend.publicKey),
				encryptMessage(messageText, profile.publicKey),
			]);

			await sendMessage({
				receiverId: state.activeChatFriend.userId,
				encryptedBody: receiverCiphertext,
				senderEncryptedBody: senderCiphertext,
			});
		} catch (err) {
			console.error(err);
		}
	};

	const handleImportExam = async (examId: any) => {
		try {
			await importExam({ examId });
			dispatch({ type: "SET_IMPORT_SUCCESS_ID", payload: examId });
			setTimeout(
				() => dispatch({ type: "SET_IMPORT_SUCCESS_ID", payload: null }),
				2500,
			);
		} catch (err: any) {
			alert(`${t.common.error}: ${err.message}`);
		}
	};

	const handleBlockFriend = async (blockedUserId: string, username: string) => {
		if (confirm(t.friends.confirmBlockUser(username))) {
			try {
				await blockUser({ blockedUserId });
				if (state.activeChatFriend?.userId === blockedUserId) {
					dispatch({ type: "SET_ACTIVE_CHAT_FRIEND", payload: null });
				}
			} catch (err: any) {
				alert(`${t.common.error}: ${err.message}`);
			}
		}
	};

	return {
		handleCreateProfile,
		handleSendRequest,
		handleRespond,
		handleSendMessage,
		handleImportExam,
		handleBlockFriend,
	};
}

export function FriendsView() {
	const { t } = useLanguage();
	const [state, dispatch] = useReducer(friendsReducer, initialState);
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	const friendsApi = (api as any).friends;

	const profile = useQuery(friendsApi.getProfile);
	const friendships = useQuery(friendsApi.getFriendships);
	const leaderboard = useQuery(friendsApi.getFriendsLeaderboard);

	const totalUnreadMessages =
		friendships?.accepted?.reduce(
			// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
			(acc: number, f: any) => acc + (f.unreadCount || 0),
			0,
		) || 0;

	const createProfile = useMutation(friendsApi.createOrUpdateProfile);
	const sendRequest = useMutation(friendsApi.sendFriendRequest);
	const respondRequest = useMutation(friendsApi.respondToFriendRequest);
	const sendMessage = useMutation(friendsApi.sendMessage);
	const importExam = useMutation(friendsApi.importFriendExam);
	const blockUser = useMutation(friendsApi.blockUser);
	const markMessagesAsRead = useMutation(friendsApi.markMessagesAsRead);

	const searchResults = useQuery(
		friendsApi.searchProfile,
		state.searchQuery.trim().length > 0 ? { query: state.searchQuery } : "skip",
	);

	const chatMessages = useQuery(
		friendsApi.getMessages,
		state.activeChatFriend
			? { friendUserId: state.activeChatFriend.userId }
			: "skip",
	);

	const friendExams = useQuery(
		friendsApi.getFriendExams,
		state.viewExamsFriend
			? { friendUserId: state.viewExamsFriend.userId }
			: "skip",
	);

	const chatBottomRef = useRef<HTMLDivElement>(null);

	// Auto-scroll chat to bottom
	useEffect(() => {
		chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	// ── Mark active chat messages as read ────────────────────────────────
	useEffect(() => {
		if (state.activeChatFriend && chatMessages && chatMessages.length > 0) {
			const hasUnread = chatMessages.some(
				// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
				(msg: any) =>
					msg.senderId === state.activeChatFriend.userId && !msg.read,
			);
			if (hasUnread) {
				void markMessagesAsRead({
					friendUserId: state.activeChatFriend.userId,
				});
			}
		}
	}, [state.activeChatFriend, chatMessages, markMessagesAsRead]);

	// ── Key recovery: regenerate keypair if private key is missing ────
	useEffect(() => {
		let timerId: ReturnType<typeof setTimeout> | undefined;
		if (profile && !hasPrivateKey()) {
			(async () => {
				try {
					const newPubKey = await generateAndSaveKeys();
					await createProfile({
						username: profile.username,
						publicKey: newPubKey,
					});
					dispatch({ type: "SET_KEY_RECOVERED", payload: true });
					// Auto-dismiss after 8 seconds
					timerId = setTimeout(
						() => dispatch({ type: "SET_KEY_RECOVERED", payload: false }),
						8000,
					);
				} catch (err) {
					console.error("Key recovery failed:", err);
				}
			})();
		}
		return () => {
			if (timerId) {
				clearTimeout(timerId);
			}
		};
	}, [profile, createProfile]);

	const {
		handleCreateProfile,
		handleSendRequest,
		handleRespond,
		handleSendMessage,
		handleImportExam,
		handleBlockFriend,
	} = useFriendsActions({
		createProfile,
		sendRequest,
		respondRequest,
		sendMessage,
		importExam,
		blockUser,
		dispatch,
		state,
		profile,
		t,
	});

	if (profile === undefined) {
		return (
			<div className="loading-spinner">
				<div className="spinner" />
			</div>
		);
	}

	// Profile Setup Screen
	if (!profile) {
		return (
			<ProfileSetup
				usernameInput={state.usernameInput}
				setUsernameInput={(v) =>
					dispatch({ type: "SET_USERNAME_INPUT", payload: v })
				}
				isSubmittingProfile={state.isSubmittingProfile}
				profileError={state.profileError}
				handleCreateProfile={handleCreateProfile}
			/>
		);
	}

	return (
		<div>
			<FriendsHeader
				t={t}
				keyRecovered={state.keyRecovered}
				username={profile.username}
			/>

			<FriendsNavigationTabs
				t={t}
				activeTab={state.activeTab}
				totalUnreadMessages={totalUnreadMessages}
				setActiveTab={(tab) =>
					dispatch({ type: "SET_ACTIVE_TAB", payload: tab })
				}
			/>

			{state.activeTab === "leaderboard" && (
				<LeaderboardTab leaderboard={leaderboard} profile={profile} />
			)}

			{state.activeTab === "chat" && (
				<ChatTab
					friendships={friendships}
					activeChatFriend={state.activeChatFriend}
					setActiveChatFriend={(f) =>
						dispatch({ type: "SET_ACTIVE_CHAT_FRIEND", payload: f })
					}
					chatMessages={chatMessages}
					chatInput={state.chatInput}
					setChatInput={(v) => dispatch({ type: "SET_CHAT_INPUT", payload: v })}
					handleSendMessage={handleSendMessage}
					profile={profile}
					chatBottomRef={chatBottomRef}
				/>
			)}

			{state.activeTab === "manage" && (
				<ManageFriendsTab
					searchQuery={state.searchQuery}
					setSearchQuery={(v) =>
						dispatch({ type: "SET_SEARCH_QUERY", payload: v })
					}
					handleSendRequest={handleSendRequest}
					requestError={state.requestError}
					requestSuccess={state.requestSuccess}
					searchResults={searchResults}
					friendships={friendships}
					handleRespond={handleRespond}
					setViewExamsFriend={(f) =>
						dispatch({ type: "SET_VIEW_EXAMS_FRIEND", payload: f })
					}
					setActiveChatFriend={(f) =>
						dispatch({ type: "SET_ACTIVE_CHAT_FRIEND", payload: f })
					}
					setActiveTab={(tab) =>
						dispatch({ type: "SET_ACTIVE_TAB", payload: tab })
					}
					handleBlockFriend={handleBlockFriend}
				/>
			)}

			{state.viewExamsFriend && (
				<ViewExamsModal
					viewExamsFriend={state.viewExamsFriend}
					setViewExamsFriend={(f) =>
						dispatch({ type: "SET_VIEW_EXAMS_FRIEND", payload: f })
					}
					friendExams={friendExams}
					importSuccessId={state.importSuccessId}
					handleImportExam={handleImportExam}
				/>
			)}
		</div>
	);
}
