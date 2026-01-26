import "./App.css";
import { useStreamMessages } from "./hooks/useSendAndRecieveMessages.ts";
import {setUserName} from "./hooks/useUserName.ts";

function App() {
  const { message, messages, setMessage, sendMessageToServer, isTypingHandler } = useStreamMessages();

  const SendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (username != null) {
      sendMessageToServer(username);
    }
  }

  const [username, setUsername] = setUserName();

  const handleSetUsername = () => {
    const name = prompt("Enter your username:");
    if (name && name.trim()) {
      setUsername(name.trim());
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
        <div className="app-card">

          <h1 className="app-title">Message</h1>

          <div className="form-row">
            <input
                name="message"
                type="text"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value) && handleIsTyping()}
                onKeyDown={(e) => e.key === "Enter" && SendMessage(e)}
            />
            <button type="button" onClick={SendMessage}>
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
