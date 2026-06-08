import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import React, { useReducer, useEffect, useRef } from "react";
import { generateAndSaveKeys, encryptMessage, hasPrivateKey } from "../utils/crypto";

// Sub-components
import { ProfileSetup } from "../components/friends/ProfileSetup";
import { LeaderboardTab } from "../components/friends/LeaderboardTab";
import { ChatTab } from "../components/friends/ChatTab";
import { ManageFriendsTab } from "../components/friends/ManageFriendsTab";
import { ViewExamsModal } from "../components/friends/ViewExamsModal";

interface FriendsState {
  activeTab: "leaderboard" | "chat" | "manage";
  usernameInput: string;
  isSubmittingProfile: boolean;
  profileError: string;
  searchQuery: string;
  requestError: string;
  requestSuccess: string;
  activeChatFriend: any | null;
  chatInput: string;
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
  | { type: "SET_ACTIVE_CHAT_FRIEND"; payload: any | null }
  | { type: "SET_CHAT_INPUT"; payload: string }
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

function friendsReducer(state: FriendsState, action: FriendsAction): FriendsState {
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
      return { ...state, isSubmittingProfile: false, profileError: action.payload };
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

export function FriendsView() {
  const [state, dispatch] = useReducer(friendsReducer, initialState);
  const friendsApi = (api as any).friends;

  const profile = useQuery(friendsApi.getProfile);
  const friendships = useQuery(friendsApi.getFriendships);
  const leaderboard = useQuery(friendsApi.getFriendsLeaderboard);

  const totalUnreadMessages = friendships?.accepted?.reduce((acc: number, f: any) => acc + (f.unreadCount || 0), 0) || 0;

  const createProfile = useMutation(friendsApi.createOrUpdateProfile);
  const sendRequest = useMutation(friendsApi.sendFriendRequest);
  const respondRequest = useMutation(friendsApi.respondToFriendRequest);
  const sendMessage = useMutation(friendsApi.sendMessage);
  const importExam = useMutation(friendsApi.importFriendExam);
  const blockUser = useMutation(friendsApi.blockUser);
  const markMessagesAsRead = useMutation(friendsApi.markMessagesAsRead);

  const searchResults = useQuery(
    friendsApi.searchProfile,
    state.searchQuery.trim().length > 0 ? { query: state.searchQuery } : "skip"
  );

  const chatMessages = useQuery(
    friendsApi.getMessages,
    state.activeChatFriend ? { friendUserId: state.activeChatFriend.userId } : "skip"
  );

  const friendExams = useQuery(
    friendsApi.getFriendExams,
    state.viewExamsFriend ? { friendUserId: state.viewExamsFriend.userId } : "skip"
  );

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ── Mark active chat messages as read ────────────────────────────────
  useEffect(() => {
    if (state.activeChatFriend && chatMessages && chatMessages.length > 0) {
      const hasUnread = chatMessages.some(
        (msg: any) => msg.senderId === state.activeChatFriend.userId && !msg.read
      );
      if (hasUnread) {
        void markMessagesAsRead({ friendUserId: state.activeChatFriend.userId });
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
          timerId = setTimeout(() => dispatch({ type: "SET_KEY_RECOVERED", payload: false }), 8000);
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
  }, [profile, createProfile, dispatch]);

  if (profile === undefined) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  // Handle Profile Creation (Generates Keypair & chooses username)
  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "START_SUBMIT_PROFILE" });

    try {
      // 1. Generate RSA keypair on client
      const pubKeyBase64 = await generateAndSaveKeys();

      // 2. Upload to Convex
      await createProfile({
        username: state.usernameInput,
        publicKey: pubKeyBase64,
      });
      dispatch({ type: "SUBMIT_PROFILE_SUCCESS" });
    } catch (err: any) {
      dispatch({
        type: "SUBMIT_PROFILE_ERROR",
        payload: err.message || "Failed to create profile. Choose a unique username.",
      });
    }
  };

  // Profile Setup Screen
  if (!profile) {
    return (
      <ProfileSetup
        usernameInput={state.usernameInput}
        setUsernameInput={(v) => dispatch({ type: "SET_USERNAME_INPUT", payload: v })}
        isSubmittingProfile={state.isSubmittingProfile}
        profileError={state.profileError}
        handleCreateProfile={handleCreateProfile}
      />
    );
  }

  // Handle sending request
  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SET_REQUEST_ERROR", payload: "" });
    dispatch({ type: "SET_REQUEST_SUCCESS", payload: "" });
    try {
      await sendRequest({ username: state.searchQuery });
      dispatch({ type: "SET_REQUEST_SUCCESS", payload: `Friend request sent to ${state.searchQuery}!` });
      dispatch({ type: "SET_SEARCH_QUERY", payload: "" });
    } catch (err: any) {
      dispatch({ type: "SET_REQUEST_ERROR", payload: err.message || "Failed to send request." });
    }
  };

  // Respond to request
  const handleRespond = async (friendshipId: any, action: "accept" | "reject") => {
    try {
      await respondRequest({ friendshipId, action });
    } catch (err: any) {
      alert("Error responding: " + err.message);
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.chatInput.trim() || !state.activeChatFriend) return;

    const messageText = state.chatInput.trim();
    dispatch({ type: "SET_CHAT_INPUT", payload: "" });

    try {
      // 1. Parallel hybrid encryption (AES-GCM + RSA-OAEP key wrapping)
      const [receiverCiphertext, senderCiphertext] = await Promise.all([
        encryptMessage(messageText, state.activeChatFriend.publicKey),
        encryptMessage(messageText, profile.publicKey),
      ]);

      // 2. Send ciphertexts to Convex
      await sendMessage({
        receiverId: state.activeChatFriend.userId,
        encryptedBody: receiverCiphertext,
        senderEncryptedBody: senderCiphertext,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Import exam
  const handleImportExam = async (examId: any) => {
    try {
      await importExam({ examId });
      dispatch({ type: "SET_IMPORT_SUCCESS_ID", payload: examId });
      setTimeout(() => dispatch({ type: "SET_IMPORT_SUCCESS_ID", payload: null }), 2500);
    } catch (err: any) {
      alert("Import failed: " + err.message);
    }
  };

  // Block friend
  const handleBlockFriend = async (blockedUserId: string, username: string) => {
    if (confirm(`Are you sure you want to block ${username}?`)) {
      try {
        await blockUser({ blockedUserId });
        if (state.activeChatFriend?.userId === blockedUserId) {
          dispatch({ type: "SET_ACTIVE_CHAT_FRIEND", payload: null });
        }
      } catch (err: any) {
        alert("Failed to block: " + err.message);
      }
    }
  };

  return (
    <div>
      {state.keyRecovered && (
        <div className="key-recovery-banner">
          <span style={{ fontSize: "1.2rem" }}>🔑</span>
          <span>Encryption keys regenerated. Messages from previous sessions may not be decryptable.</span>
        </div>
      )}
      <div className="page-header">
        <div>
          <h1>Study Guild</h1>
          <div className="date-display">Logged in as {profile.username}</div>
        </div>
      </div>

      <div className="friends-nav-tabs">
        <button
          type="button"
          className={`friend-tab-btn ${state.activeTab === "leaderboard" ? "active" : ""}`}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "leaderboard" })}
        >
          🏆 Leaderboard
        </button>
        <button
          type="button"
          className={`friend-tab-btn ${state.activeTab === "chat" ? "active" : ""}`}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "chat" })}
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          💬 Secure Chat
          {totalUnreadMessages > 0 && (
            <span className="chat-tab-unread-badge">{totalUnreadMessages}</span>
          )}
        </button>
        <button
          type="button"
          className={`friend-tab-btn ${state.activeTab === "manage" ? "active" : ""}`}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "manage" })}
        >
          👥 Friends & Search
        </button>
      </div>

      {state.activeTab === "leaderboard" && (
        <LeaderboardTab
          leaderboard={leaderboard}
          profile={profile}
        />
      )}

      {state.activeTab === "chat" && (
        <ChatTab
          friendships={friendships}
          activeChatFriend={state.activeChatFriend}
          setActiveChatFriend={(f) => dispatch({ type: "SET_ACTIVE_CHAT_FRIEND", payload: f })}
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
          setSearchQuery={(v) => dispatch({ type: "SET_SEARCH_QUERY", payload: v })}
          handleSendRequest={handleSendRequest}
          requestError={state.requestError}
          requestSuccess={state.requestSuccess}
          searchResults={searchResults}
          friendships={friendships}
          handleRespond={handleRespond}
          setViewExamsFriend={(f) => dispatch({ type: "SET_VIEW_EXAMS_FRIEND", payload: f })}
          setActiveChatFriend={(f) => dispatch({ type: "SET_ACTIVE_CHAT_FRIEND", payload: f })}
          setActiveTab={(tab) => dispatch({ type: "SET_ACTIVE_TAB", payload: tab })}
          handleBlockFriend={handleBlockFriend}
        />
      )}

      {state.viewExamsFriend && (
        <ViewExamsModal
          viewExamsFriend={state.viewExamsFriend}
          setViewExamsFriend={(f) => dispatch({ type: "SET_VIEW_EXAMS_FRIEND", payload: f })}
          friendExams={friendExams}
          importSuccessId={state.importSuccessId}
          handleImportExam={handleImportExam}
        />
      )}
    </div>
  );
}
