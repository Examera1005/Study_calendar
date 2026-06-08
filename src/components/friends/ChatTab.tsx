import React from "react";
import { useState, useEffect } from "react";
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
  const [body, setBody] = useState<string>("🔒 Decrypting...");

  useEffect(() => {
    let active = true;
    async function decrypt() {
      const ciphertext = isMe ? senderEncryptedBody : encryptedBody;
      const decrypted = await decryptMessage(ciphertext);
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

interface ChatTabProps {
  friendships: any;
  activeChatFriend: any;
  setActiveChatFriend: (f: any) => void;
  chatMessages: any[] | undefined;
  chatInput: string;
  setChatInput: (v: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
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
  return (
    <div className="friends-layout">
      {/* Active conversations / Friends list */}
      <div className={`card conversations-list-card ${activeChatFriend ? "has-active-chat" : ""}`} style={{ padding: 12 }}>
        <h3 style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 12, marginBottom: 8 }}>
          Conversations
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {friendships?.accepted && friendships.accepted.length > 0 ? (
            friendships.accepted.map((friend: any) => (
              <button
                key={friend.userId}
                type="button"
                className={`nav-item ${activeChatFriend?.userId === friend.userId ? "active" : ""}`}
                onClick={() => setActiveChatFriend(friend)}
                style={{ justifyContent: "space-between", alignItems: "center" }}
              >
                <span>💬 {friend.username}</span>
                {friend.unreadCount > 0 && (
                  <span className="chat-unread-badge">{friend.unreadCount}</span>
                )}
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
      <div className={`chat-window ${activeChatFriend ? "has-active-chat" : ""}`}>
        {activeChatFriend ? (
          <>
            <div className="chat-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  className="mobile-back-btn"
                  onClick={() => setActiveChatFriend(null)}
                  aria-label="Back to conversations list"
                >
                  ⬅️
                </button>
                <div>
                  <h3 style={{ fontSize: "1.05rem", color: "var(--text-primary)", margin: 0 }}>{activeChatFriend.username}</h3>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Active Conversation</span>
                </div>
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
                aria-label="Type an encrypted message"
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
  );
}
