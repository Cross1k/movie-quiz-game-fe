import React, { useEffect, useMemo, useState } from "react";
import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";
import { useParams } from "react-router-dom";
import Modal from "react-modal";

export default function HostPage() {
  const [playerName, setPlayerName] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [themes, setThemes] = useState(null);
  const [count, setCount] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [hostId, setHostId] = useState(localStorage.getItem("hostId") || null);

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

  // let count = 0;

  // useMemo(() => {
  //   count;
  // }, [count, themes]);

  useEffect(() => {
    socket.emit("host_join_room", session, socket.id);

    socket.on("player_answer", (id) => {
      console.log("Received answer:", id);
      setPlayerName(id);
      setIsAnswering(true);
    });

    setTimeout(() => {
      console.log(socket.id);
      socket.emit("host_join_room", session, socket.id);
    }, 1000);

    socket.on("all_themes", (themes) => {
      setThemes(themes);
      console.log(themes);
    });
    return () => {
      socket.off("player_answer");
      // socket.off("player_answer");
      socket.off("all_themes");
    };
  }, [session]);

  useEffect(() => {
    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, []);

  const handleGoodAnswer = () => {
    socket.emit("answer_yes", session, playerName);
    socket.emit("round_end", session);
    setIsAnswering(false);
    setTimeout(() => {
      setPlayerName(null);
      setIsModalOpen(false);
    }, 4000);
  };

  const handleBadAnswer = () => {
    socket.emit("answer_no", session);
    setPlayerName(null);
    setIsAnswering(false);
  };
  // let count = 0;
  const handleChangeFrame = () => {
    socket.emit("change_frame", session);
    setCount(count + 1);
    console.log(count);
    if (count === 5) {
      socket.emit("round_end", session);
      setCount(1);
      setIsAnswering(false);
      setTimeout(() => {
        setIsModalOpen(false);
      }, 4000);
    }
  };

  const handleStartGame = () => {
    setTimeout(() => {
      socket.emit("start_game", session);
      console.log("click", session);
    }, 400);
  };

  const handleEndGame = () => {
    setTimeout(() => {
      socket.emit("end_game", session);
    }, 400);
  };

  return (
    <div className="host-container">
      <h1>Страница ведущего</h1>
      {socket.id && <h2>{socket.id}</h2>}
      <button onClick={handleStartGame}>Start Game</button>
      <button onClick={handleEndGame}>End Game</button>
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
            {Object.entries(themes).map(([theme, movies]) => (
              <li key={theme}>
                <strong>{theme}</strong>
                <ul>
                  {movies.movies.map((movie, index) => (
                    <li key={index}>
                      <button
                        onClick={(e) => {
                          socket.emit("get_frames", session, theme, movie.name);
                          socket.emit("start_round", session);
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
