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

  let count = 0;

  useEffect(() => {
    // socket.emit("host_join_room", session, socket.id, hostId);

    socket.on("player_answer", (id) => {
      console.log("Received answer:", id);
      setPlayerName(id);
      setIsAnswering(true);
    });

    setTimeout(() => {
      console.log(socket.id);
      socket.emit("host_join_room", session, socket.id, hostId);
      socket.on("host_joined_room", (_id) => {
        if (_id === hostId) return;
        setHostId(_id);
        localStorage.setItem("hostId", _id);
      });
    }, 700);

    socket.on("game_page_id", (id) => {
      console.log("Received game id:", id);
      socket.emit("get_themes");
      setGamePageId(id);
    });

    // socket.on("game_page_id", (gameId) => {
    //   setGamePageId(gameId);
    // });

    socket.on("themes_list", (themes) => {
      setThemes(themes);
    });
  }, [hostId, session]);

  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  const handleGoodAnswer = () => {
    socket.emit("answer_yes", session);
    setIsAnswering(false);
    setTimeout(() => {
      setIsModalOpen(false);
    }, 4000);
  };

  const handleBadAnswer = () => {
    socket.emit("answer_no", session);
    setIsAnswering(false);
  };

  const handleChangeFrame = () => {
    socket.emit("change_frame", session);
    count++;
    if (count === 5) {
      socket.emit("round_end", session);
      count = 0;
      setIsAnswering(false);
      setTimeout(() => {
        setIsModalOpen(false);
      }, 4000);
    }
  };

  return (
    <div className="host-container">
      <h1>Страница ведущего</h1>
      <button onClick={() => socket.emit("end_game", session)}>End Game</button>
      <button onClick={() => socket.emit("start_game", session)}>
        Start Game
      </button>
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
                            "get_frames",
                            gamePageId,
                            themes[theme],
                            movie.name
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
