import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { Modal } from "../components/ui/Modal";
import { generateAndSaveKeys, encryptWithPublicKey, decryptWithPrivateKey } from "../utils/crypto";

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
  const [body, setBody] = useState<string>("🔒 Decrypting...");

  useEffect(() => {
    let active = true;
    async function decrypt() {
      const ciphertext = isMe ? senderEncryptedBody : encryptedBody;
      const decrypted = await decryptWithPrivateKey(ciphertext);
      if (active) {
        setBody(decrypted);
      }
    }
    void decrypt();
    return () => {
      active = false;
    };
  }, [encryptedBody, senderEncryptedBody, isMe]);

  return (
    <div className={`chat-message-row ${isMe ? "me" : "them"}`}>
      <div className="chat-message-bubble">
        <div>{body}</div>
        <span className="chat-message-time">
          {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

export function FriendsView() {
  const friendsApi = (api as any).friends;

  const profile = useQuery(friendsApi.getProfile);
  const friendships = useQuery(friendsApi.getFriendships);
  const leaderboard = useQuery(friendsApi.getFriendsLeaderboard);

  const createProfile = useMutation(friendsApi.createOrUpdateProfile);
  const sendRequest = useMutation(friendsApi.sendFriendRequest);
  const respondRequest = useMutation(friendsApi.respondToFriendRequest);
  const sendMessage = useMutation(friendsApi.sendMessage);
  const importExam = useMutation(friendsApi.importFriendExam);

  // Tabs: "leaderboard" | "chat" | "manage"
  const [activeTab, setActiveTab] = useState<"leaderboard" | "chat" | "manage">("leaderboard");
  
  // Profile Form state
  const [usernameInput, setUsernameInput] = useState("");
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Friends search
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = useQuery(
    friendsApi.searchProfile,
    searchQuery.trim().length > 0 ? { query: searchQuery } : "skip"
  );
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");

  // Chat conversation
  const [activeChatFriend, setActiveChatFriend] = useState<any | null>(null);
  const chatMessages = useQuery(
    friendsApi.getMessages,
    activeChatFriend ? { friendUserId: activeChatFriend.userId } : "skip"
  );
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Friend exams view
  const [viewExamsFriend, setViewExamsFriend] = useState<any | null>(null);
  const friendExams = useQuery(
    friendsApi.getFriendExams,
    viewExamsFriend ? { friendUserId: viewExamsFriend.userId } : "skip"
  );
  const [importSuccessId, setImportSuccessId] = useState<string | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  if (profile === undefined) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  // Handle Profile Creation (Generates Keypair & chooses username)
  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setIsSubmittingProfile(true);

    try {
      // 1. Generate RSA keypair on client
      const pubKeyBase64 = await generateAndSaveKeys();

      // 2. Upload to Convex
      await createProfile({
        username: usernameInput,
        publicKey: pubKeyBase64,
      });
    } catch (err: any) {
      setProfileError(err.message || "Failed to create profile. Choose a unique username.");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  // Profile Setup Screen
  if (!profile) {
    return (
      <div className="card" style={{ maxWidth: 450, margin: "60px auto", padding: 30 }}>
        <h2 style={{ textAlign: "center", marginBottom: 10 }}>👥 Setup Friends Handle</h2>
        <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", textAlign: "center", marginBottom: 24 }}>
          Choose a unique handle to connect with friends, share exam schedules, and rank on the leaderboard.
        </p>

        {profileError && <div className="error-msg" style={{ marginBottom: 16 }}>{profileError}</div>}

        <form onSubmit={handleCreateProfile}>
          <div className="form-group">
            <label>Choose @username</label>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="e.g. math_wizard"
              required
            />
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4, display: "block" }}>
              Only letters, numbers, and underscores allowed. We will automatically prepend "@".
            </span>
          </div>

          <div style={{ background: "var(--accent-light)", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--accent-primary)", marginBottom: 24 }}>
            <div style={{ fontSize: "0.8rem", color: "var(--accent-primary)", fontWeight: 700, marginBottom: 4 }}>
              🔒 End-to-End Encrypted Messaging
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
              Creating a profile generates a secure 2048-bit RSA key pair in your browser. All chat messages are cryptographically sealed locally before sending.
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={isSubmittingProfile}>
            {isSubmittingProfile ? "Generating Cryptographic Keys..." : "Register Profile"}
          </button>
        </form>
      </div>
    );
  }

  // Handle sending request
  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError("");
    setRequestSuccess("");
    try {
      await sendRequest({ username: searchQuery });
      setRequestSuccess(`Friend request sent to ${searchQuery}!`);
      setSearchQuery("");
    } catch (err: any) {
      setRequestError(err.message || "Failed to send request.");
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
    if (!chatInput.trim() || !activeChatFriend) return;

    const messageText = chatInput.trim();
    setChatInput("");

    try {
      // 1. Encrypt message for receiver using receiver's public key
      const receiverCiphertext = await encryptWithPublicKey(messageText, activeChatFriend.publicKey);

      // 2. Encrypt message for self using self's public key (to load locally in sent chats)
      const senderCiphertext = await encryptWithPublicKey(messageText, profile.publicKey);

      // 3. Send ciphertexts to Convex
      await sendMessage({
        receiverId: activeChatFriend.userId,
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
      setImportSuccessId(examId);
      setTimeout(() => setImportSuccessId(null), 2500);
    } catch (err: any) {
      alert("Import failed: " + err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Study Guild</h1>
          <div className="date-display">Logged in as {profile.username}</div>
        </div>
      </div>

      <div className="friends-nav-tabs">
        <button
          className={`friend-tab-btn ${activeTab === "leaderboard" ? "active" : ""}`}
          onClick={() => setActiveTab("leaderboard")}
        >
          🏆 Leaderboard
        </button>
        <button
          className={`friend-tab-btn ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          💬 Secure Chat
        </button>
        <button
          className={`friend-tab-btn ${activeTab === "manage" ? "active" : ""}`}
          onClick={() => setActiveTab("manage")}
        >
          👥 Friends & Search
        </button>
      </div>

      {/* Tab 1: Leaderboard */}
      {activeTab === "leaderboard" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <h3 style={{ marginBottom: 8 }}>Weekly Study Leaderboard</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 20 }}>
              Ranking is based on total study hours logged in the past 7 days.
            </p>

            <div className="leaderboard-list">
              {leaderboard && leaderboard.length > 0 ? (
                leaderboard.map((user: any, idx: number) => {
                  const rankEmoji = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
                  const isSelf = user.userId === profile.userId;
                  return (
                    <div
                      key={user.userId}
                      className="leaderboard-row"
                      style={isSelf ? { border: "1px dashed var(--accent-primary)", background: "rgba(59, 130, 246, 0.04)" } : {}}
                    >
                      <div className="leaderboard-rank">{rankEmoji}</div>
                      <div className="leaderboard-user">
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                          {user.username} {isSelf && <span style={{ fontSize: "0.75rem", background: "var(--accent-light)", color: "var(--accent-primary)", padding: "2px 6px", borderRadius: 4 }}>You</span>}
                        </div>
                        
                        {/* Subjects studied */}
                        {user.subjectsStudied.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                            {user.subjectsStudied.map((sub: any) => (
                              <span
                                key={sub.name}
                                style={{
                                  fontSize: "0.72rem",
                                  padding: "2px 8px",
                                  borderRadius: "var(--radius-md)",
                                  background: sub.color + "1A",
                                  border: `1px solid ${sub.color}`,
                                  color: sub.color,
                                }}
                              >
                                {sub.icon} {sub.name} ({Math.round(sub.duration)}m)
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 6 }}>
                            No subjects studied yet this week
                          </div>
                        )}

                        {/* Upcoming exams */}
                        {user.upcomingExams.length > 0 && (
                          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: 8, display: "flex", gap: 10 }}>
                            <strong>Preparing for:</strong>
                            {user.upcomingExams.map((ex: any) => (
                              <span key={ex.title}>
                                {ex.title} ({ex.date})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="leaderboard-time">
                        {Math.floor(user.totalDuration / 60)}h {user.totalDuration % 60}m
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
                  No guild members found. Add friends to start competing!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Chat */}
      {activeTab === "chat" && (
        <div className="friends-layout">
          {/* Active conversations / Friends list */}
          <div className="card" style={{ padding: 12 }}>
            <h3 style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 12, marginBottom: 8 }}>
              Conversations
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {friendships?.accepted && friendships.accepted.length > 0 ? (
                friendships.accepted.map((friend: any) => (
                  <button
                    key={friend.userId}
                    className={`nav-item ${activeChatFriend?.userId === friend.userId ? "active" : ""}`}
                    onClick={() => setActiveChatFriend(friend)}
                    style={{ justifyContent: "space-between" }}
                  >
                    <span>💬 {friend.username}</span>
                  </button>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: 16, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  No accepted friends to message.
                </div>
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="chat-window">
            {activeChatFriend ? (
              <>
                <div className="chat-header">
                  <div>
                    <h3 style={{ fontSize: "1rem", color: "var(--text-primary)" }}>{activeChatFriend.username}</h3>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Active Conversation</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--success)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="pulse-dot" style={{ width: 6, height: 6, background: "var(--success)", borderRadius: "50%" }} />
                    E2EE Locked
                  </div>
                </div>

                <div className="chat-messages">
                  {chatMessages && chatMessages.length > 0 ? (
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
                      <span>🔒 Messages are encrypted end-to-end.</span>
                      <span style={{ fontSize: "0.8rem" }}>Say hello to start the secure conversation!</span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                <form onSubmit={handleSendMessage} className="chat-input-area">
                  <input
                    type="text"
                    placeholder="Type an encrypted message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary">Send</button>
                </form>
              </>
            ) : (
              <div className="chat-empty">
                <h3>💬 Secure Chat</h3>
                <p style={{ fontSize: "0.82rem" }}>Select a friend from the left sidebar to start messaging.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Friends & Management */}
      {activeTab === "manage" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 20 }}>
          {/* Column A: Search & Request */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card">
              <h3>🔍 Search & Add Friends</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 16 }}>
                Search for other users by typing their username handle.
              </p>

              <form onSubmit={handleSendRequest} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="Search @username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                <button type="submit" className="btn btn-primary">Send Invite</button>
              </form>

              {requestError && <div className="error-msg" style={{ fontSize: "0.8rem" }}>{requestError}</div>}
              {requestSuccess && <div style={{ color: "var(--success)", fontSize: "0.8rem", fontWeight: 500 }}>{requestSuccess}</div>}

              {searchResults && searchResults.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 8 }}>Matching handles:</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSearchQuery(user.username);
                          }}
                        >
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pending Invites */}
            <div className="card">
              <h3>✉️ Pending Invites</h3>
              
              <div style={{ marginTop: 12 }}>
                <h4 style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 8 }}>Received Requests</h4>
                {friendships?.pendingReceived && friendships.pendingReceived.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
                            className="btn btn-primary btn-sm"
                            onClick={() => handleRespond(req.friendshipId, "accept")}
                          >
                            Accept
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleRespond(req.friendshipId, "reject")}
                          >
                            Deny
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", padding: 6 }}>
                    No incoming requests.
                  </div>
                )}
              </div>

              <div style={{ marginTop: 20 }}>
                <h4 style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 8 }}>Sent Invites</h4>
                {friendships?.pendingSent && friendships.pendingSent.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleRespond(req.friendshipId, "reject")}
                        >
                          Cancel
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", padding: 6 }}>
                    No sent invites pending.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column B: Friends List */}
          <div className="card">
            <h3>👥 Accepted Friends</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 20 }}>
              Your friends can compete with you on the leaderboard, send secure chats, and let you import their exam schedules.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {friendships?.accepted && friendships.accepted.length > 0 ? (
                friendships.accepted.map((friend: any) => (
                  <div
                    key={friend.userId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background: "var(--bg-primary)",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{friend.username}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 4 }}>
                        🔒 End-to-End Cryptography Active
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setViewExamsFriend(friend)}
                      >
                        🎯 View Exams
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setActiveChatFriend(friend);
                          setActiveTab("chat");
                        }}
                      >
                        💬 Chat
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: 30, color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Your friends list is empty. Share your handle to get started!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: View & Import Exams */}
      {viewExamsFriend && (
        <Modal
          title={`🎯 ${viewExamsFriend.username}'s Exams`}
          onClose={() => setViewExamsFriend(null)}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              If you share these exams or want to remember when they happen, click "Add to My Calendar" to copy them directly into your exam list.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 350, overflowY: "auto" }}>
              {friendExams && friendExams.length > 0 ? (
                friendExams.map((exam: any) => {
                  const isImported = importSuccessId === exam._id;
                  return (
                    <div
                      key={exam._id}
                      style={{
                        padding: 12,
                        background: "var(--bg-primary)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{exam.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
                          Date: <strong>{exam.date}</strong> · Coeff: {exam.coefficient}
                        </div>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            marginTop: 6,
                            display: "inline-block",
                            padding: "1px 6px",
                            borderRadius: 4,
                            background: exam.subjectColor + "1A",
                            color: exam.subjectColor,
                            border: `1px solid ${exam.subjectColor}`,
                          }}
                        >
                          {exam.subjectIcon} {exam.subjectName}
                        </div>
                      </div>
                      <button
                        className={`btn btn-sm ${isImported ? "btn-secondary" : "btn-primary"}`}
                        onClick={() => handleImportExam(exam._id)}
                        disabled={isImported}
                      >
                        {isImported ? "✓ Added!" : "+ Add to My Calendar"}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>
                  No exams registered for this user yet.
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ marginTop: 10 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setViewExamsFriend(null)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
