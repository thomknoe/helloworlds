import { useState, useEffect, useRef } from "react";
export default function GameConsole({ messages = [] }) {
  const [displayMessage, setDisplayMessage] = useState("");
  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      setDisplayMessage(lastMessage);
    } else {
      setDisplayMessage("");
    }
  }, [messages]);
  return (
    <div className="game-console">
      <div className="game-console-content">
        {displayMessage ? (
          <div className="game-console-message">
            {displayMessage}
          </div>
        ) : (
          <div className="game-console-message" style={{ opacity: 0.5 }}>
            Dialogue ready...
          </div>
        )}
      </div>
    </div>
  );
}
