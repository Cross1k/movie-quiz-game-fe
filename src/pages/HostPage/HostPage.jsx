import React, { useEffect, useState } from "react";
import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";
import { useParams } from "react-router-dom";

export default function HostPage() {
  const [playerName, setPlayerName] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [themes, setThemes] = useState([]);

  const { session } = useParams();

  useEffect(() => {
    connectSocket();
    // Создаем сессию при монтировании компонента
    socket.emit("create_session", session);

    socket.on("broadcast_answer", (id) => {
      setPlayerName(id);
      setIsAnswering(true);
    });

    socket.emit("get_themes");
    socket.on("themes_list", (themes) => {
      setThemes(themes);
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
      <h2>THEMES</h2>
      {themes.length > 0 &&
        themes.map((theme) => (
          <button
            key={theme.external_id}
            onClick={() => socket.emit("select_theme", theme.path, session.id)}
          >
            {theme.name}
          </button>
        ))}
    </div>
  );
}
