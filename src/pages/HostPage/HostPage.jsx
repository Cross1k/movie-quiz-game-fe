import React, { useEffect, useState } from "react";
import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";
import { useParams } from "react-router-dom";
import Modal from "react-modal";

export default function HostPage() {
  const [playerName, setPlayerName] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [themes, setThemes] = useState(null);
  const [gamePageId, setGamePageId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [disabledMovies, setDisabledMovies] = useState(new Set());
  const [hostId, setHostId] = useState(localStorage.getItem("hostId") || null);

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
    // socket.emit("host_page_id", session);

    socket.on("broadcast_answer", (playerName) => {
      console.log("Received answer:", playerName);
      setPlayerName(playerName);
      setIsAnswering(true);
    });

    setTimeout(() => {
      console.log(socket.id);
      socket.emit("host_page_id", session, socket.id, hostId);
      socket.on("host_page_id_answer", (_id) => {
        setHostId(_id);
        localStorage.setItem("hostId", _id);
      });
    }, 700);

    socket.on("send_game_page_id", (id) => {
      console.log("Received game id:", id);
      socket.emit("get_themes");
      setGamePageId(id);
    });

    socket.on("themes_list", (themes) => {
      setThemes(themes);
    });
    return () => {
      disconnectSocket();
    };
  }, [hostId, session]);

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
      <button onClick={() => socket.emit("end_game", session)}>End Game</button>
      <div>
        <Modal isOpen={isModalOpen} style={customStyles}>
          <h2>Имя игрока:</h2>
          <p>{playerName}</p>
          {isAnswering ? (
            <>
              <button onClick={handleGoodAnswer}>Yes</button>
              <button onClick={handleBadAnswer}>No</button>
            </>
          ) : (
            <button onClick={handleChangeFrame}>Next</button>
          )}
        </Modal>
      </div>
      {themes != null && (
        <>
          <h2>THEMES</h2>
          <ul>
            {Object.keys(themes).map((theme) => (
              <li key={theme}>
                <strong>{theme}</strong>
                <ul>
                  {themes[theme].movies.map((movie) => (
                    <li key={movie.index}>
                      <button
                        onClick={(e) => {
                          socket.emit(
                            "select_movie",
                            themes[theme],
                            movie.name,
                            gamePageId
                          );
                          setIsModalOpen(true);
                          e.target.disabled = true;
                        }}
                      >
                        {`${movie.index + 1}: ${movie.name}`}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
