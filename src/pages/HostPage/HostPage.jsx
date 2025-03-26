import React, { useEffect, useState } from "react";
import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";
import { useParams } from "react-router-dom";

export default function HostPage() {
  const [playerName, setPlayerName] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);

  const { session } = useParams();

  useEffect(() => {
    connectSocket();
    // Создаем сессию при монтировании компонента
    socket.emit("create_session", session);

    socket.on("broadcast_answer", (id) => {
      setPlayerName(id);
      setIsAnswering(true);
    });

    return () => {
      disconnectSocket();
    };
  }, [session]);

  const handleGoodAnswer = () => {
    socket.emit("good_answer", session);
    setIsAnswering(false);
  };

  const handleBadAnswer = () => {
    socket.emit("bad_answer", session);
    setIsAnswering(false);
  };

  return (
    <div className="host-container">
      <h1>Страница ведущего</h1>
      <div className="session-info">
        <h2>Код сессии:</h2>
        <div className="session-code">{session}</div>
        <h2>Имя игрока:</h2>
        <div className="player-name">{playerName}</div>
        {isAnswering && (
          <>
            <button onClick={handleGoodAnswer}>Yes</button>
            <button onClick={handleBadAnswer}>No</button>
          </>
        )}
      </div>
    </div>
  );
}
