import "./App.css";
import { useStreamMessages } from "./hooks/useSendAndRecieveMessages.ts";
import { useUserName } from "./hooks/useUserName.ts";
import { useEncryptionKey } from "./hooks/useEncryptionKey.ts";
import { useAutoScroll } from "./hooks/useAutoScroll.ts";
import {useEffect, useMemo} from "react";
import {useStream} from "./hooks/useStream.tsx";

function Chats() {
  const { username } = useUserName();
  const { encryptionKey, setEncryptionKey } = useEncryptionKey();
  const {
    message,
    messages,
    setMessage,
    sendMessageToServer,
    isTypingHandler,
    isTyping,
    typingUser,
    stopTyping,
  } = useStreamMessages({ encryptionKey, currentUser: username });

  const activeUsers = useMemo(() => {

  }, [username]);

  const { containerRef: chatListRef } = useAutoScroll<HTMLDivElement>([messages]);

  const handleSendMessage = async () => {
    if (!username) {
      alert("Please set a username before sending a message.");
      return;
    }

    await sendMessageToServer(username);
    stopTyping();
  };

  const stream = useStream()

  useEffect(() => {
stream.on<any>("general", "JoinGroupBroadcast", () => {
  useMemo(() => {

  }, [username])

})

  }, [])


  const handleSetKey = () => {
    const key = prompt(
        encryptionKey ? "Update encryption key:" : "Enter encryption key:",
        encryptionKey ?? undefined
    );
    if (key !== null) {
      const nextKey = key.trim();
      setEncryptionKey(nextKey ? nextKey : null);
    }
  };

  const handleIsTyping = () => {
    isTypingHandler();
  };

  const activeTypingText = typingUser ? `${typingUser} is typing...` : isTyping ? "Someone is typing..." : null;

  return (
      <div className="app-shell">

          <h1 className="top-right-button">
            {username || "Set Username"}
          </h1>
          <button className="top-right-button2" onClick={handleSetKey} >
            {encryptionKey ? "Key Set" : "Set Key"}
          </button>

        <div className="app-card">

          <h1 className="app-title">Message</h1>

          <div className="chat-area">
            <div className="chat-list" ref={chatListRef}>
              {messages.map((msg, index) => (
                  <div
                      key={index}
                      className={`chat-row ${
                          msg.user === username ? "chat-row-end" : "chat-row-start"
                      }`}
                  >
                    <div className={`chat ${
                        msg.user === username ? "chat-end" : "chat-start"
                    }`}>
                      <div className="chat-header">{msg.user}</div>
                      <div className="chat-bubble">{msg.content}</div>
                    </div>
                  </div>
              ))}
            </div>
            <span className="typing-indicator">
              {activeTypingText ?? ""}
            </span>
          </div>

          <div className="form-row">
            <input
                name="message"
                type="text"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleIsTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleSendMessage();
                  }
                }}
            />
            <button
                type="button"
                onClick={() => {
                  void handleSendMessage();
                }}
            >
              Send
            </button>
          </div>
        </div>
        <aside className="side-panel users-panel">
          <div className="panel-header">
            <h2>Active Users</h2>
            <span className="panel-meta">{stream.userName}</span>
          </div>
          <ul className="panel-list">
            {stream.on(stream.on(stream.on(stream.on(stream.userName)))) === 0 && (
                <li className="panel-empty">No users have joined yet.</li>
            )}
            {activeUsers.map((user) => (
                <li key={user} className="panel-list-item">
                  <span className="panel-list-title">
                    {user}
                    {user === username && <span className="panel-badge">you</span>}
                  </span>
                  {typingUser === user && <span className="panel-list-description">typing...</span>}
                </li>
            ))}
          </ul>
        </aside>
      </div>
  );
}

export default Chats;
