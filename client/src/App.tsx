import "./App.css";
import { useStreamMessages } from "./hooks/useSendAndRecieveMessages.ts";
import { useUserName } from "./hooks/useUserName.ts";
import { useEncryptionKey } from "./hooks/useEncryptionKey.ts";

function App() {
  const { username, setUsername } = useUserName();
  const { encryptionKey, setEncryptionKey } = useEncryptionKey();
  const { message, messages, setMessage, sendMessageToServer, isTypingHandler } = useStreamMessages(encryptionKey);

  const handleSendMessage = () => {
    if (!username) {
      alert("Please set a username before sending a message.");
      return;
    }

    sendMessageToServer(username);
  };

  const handleSetUsername = () => {
    const name = prompt("Enter your username:");
    if (name && name.trim()) {
      setUsername(name.trim());
    }
  };

  const handleSetKey = () => {
    const key = prompt(encryptionKey ? "Update encryption key:" : "Enter encryption key:", encryptionKey ?? undefined);
    if (key !== null) {
      const nextKey = key.trim();
      setEncryptionKey(nextKey ? nextKey : null);
    }
  };

  const handleIsTyping = () => {
    isTypingHandler();
  }

  return (
      <div className="app-shell">
       
          <button className="top-right-button" onClick={handleSetUsername}>
            {username ? username : "Set Username"}
          </button>
          <button className="top-right-button2" onClick={handleSetKey} >
            {encryptionKey ? "Key Set" : "Set Key"}
          </button>
        
        <div className="app-card">

          <h1 className="app-title">Message</h1>

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
                    handleSendMessage();
                  }
                }}
            />
            <button type="button" onClick={handleSendMessage}>
              Send
            </button>
          </div>

          <div className="chat-list">
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
        </div>
      </div>
  );
}

export default App;
