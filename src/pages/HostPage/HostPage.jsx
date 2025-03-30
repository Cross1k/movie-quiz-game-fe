import React, { useEffect, useState } from "react";
import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";
import { useParams } from "react-router-dom";
import Modal from "react-modal";

export default function HostPage() {
  const [playerName, setPlayerName] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [themes, setThemes] = useState([]);
  const [gamePageId, setGamePageId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [disabledMovies, setDisabledMovies] = useState(new Set());

  const { session } = useParams();

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
  };

  useEffect(() => {
    connectSocket();

    socket.emit("join_room", session);

    socket.on("broadcast_answer", (id) => {
      setPlayerName(id);
      setIsAnswering(true);
    });
    setTimeout(() => {
      console.log(socket.id);
      socket.emit("host_page_id", socket.id);
    }, 500);

    socket.on("send_game_page_id", (id) => {
      console.log("Received game id:", id);
      setGamePageId(id);
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
    socket.emit("show_logo", session);
    setIsAnswering(false);
    setTimeout(() => {
      setIsModalOpen(false);
    }, 4000);
  };

  const handleBadAnswer = () => {
    socket.emit("bad_answer", session);
    setIsAnswering(false);
  };

  const handleChangeFrame = () => {
    socket.emit("change_frame", session);
  };

  return (
    <div className="host-container">
      <h1>Страница ведущего</h1>
      <div className="session-info">
        <h2>Код сессии:</h2>
        <div className="session-code">{session}</div>
        <h2>Имя игрока:</h2>
        <div className="player-name">{playerName}</div>
        <Modal isOpen={isModalOpen} style={customStyles}>
          <button onClick={handleChangeFrame}>Next</button>
          {isAnswering && (
            <>
              <button onClick={handleGoodAnswer}>Yes</button>
              <button onClick={handleBadAnswer}>No</button>
            </>
          )}
        </Modal>
      </div>
      <h2>THEMES</h2>
      {themes.length > 0 && (
        <ul>
          {themes.map((theme) => (
            <li key={theme.theme}>
              {theme.theme}
              <ul>
                {theme.movies.map((movie) => (
                  <li key={movie.index}>
                    <button
                      onClick={(e) => {
                        socket.emit(
                          "select_movie",
                          theme.theme,
                          movie.movie,
                          gamePageId
                        );
                        setIsModalOpen(true);
                        e.target.disabled = true;
                      }}
                    >{`${movie.index + 1}: ${movie.movie}`}</button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
