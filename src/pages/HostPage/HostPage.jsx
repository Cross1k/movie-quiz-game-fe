import React, { useEffect, useState } from "react";
import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "react-modal";
import css from "./HostPage.module.css";
import { ThreeCircles } from "react-loader-spinner";

let endGameBtnOff = true;
export default function HostPage() {
  const [playerName, setPlayerName] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [themes, setThemes] = useState(null);
  const [count, setCount] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const [winnerName, setWinnerName] = useState(null);
  const [winnerPts, setWinnerPts] = useState(null);
  const [gameEnd, setGameEnd] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const navigate = useNavigate();

  const { session } = useParams();

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#e4f2ff",
    },
    overlay: {
      backgroundColor: "#rgba(228, 242, 255, 0.99)",
      backdropFilter: "blur(8px)",
    },
  };

  useEffect(() => {
    setTimeout(() => {
      setSocketId(socket.id);
      socket.emit("host_join_room", session, socketId);
    }, 300);
  }, [session, socketId]);

  useEffect(() => {
    socket.on("player_answer", (id) => {
      setPlayerName(id);
      setIsAnswering(true);
    });

    socket.on("all_themes", (themes) => {
      setThemes(themes);
    });

    socket.on("end_game", (winner, pts) => {
      setWinnerName(winner);
      setWinnerPts(pts);
      setGameEnd(true);
      setTimeout(() => {
        navigate("/");
      }, 4000);
    });
    return () => {
      socket.off("player_answer");
      socket.off("all_themes");
    };
  }, [navigate, session]);

  useEffect(() => {
    if (!socket.connected) {
      setTimeout(() => {
        connectSocket();
      }, 500);
    }

    return () => {
      disconnectSocket();
    };
  }, []);

  const handleGoodAnswer = () => {
    socket.emit("answer_yes", session, playerName);
    setCount(1);
    setIsAnswering(false);
    setTimeout(() => {
      socket.emit("round_end", session);
      setPlayerName(null);
      setIsModalOpen(false);
    }, 3000);
  };

  const handleBadAnswer = () => {
    socket.emit("answer_no", session);
    setPlayerName(null);
    setIsAnswering(false);
  };
  const handleChangeFrame = () => {
    socket.emit("change_frame", session);
    setCount(count + 1);
    if (count >= 5) {
      socket.emit("round_end", session);
      setCount(1);
      setIsAnswering(false);
      setTimeout(() => {
        setIsModalOpen(false);
      }, 3000);
    }
  };

  const handleStartGame = () => {
    socket.emit("start_game", session);
    setIsButtonDisabled(false);
  };

  const handleEndGame = () => {
    socket.emit("end_game", session);
  };

  if (!socketId)
    return (
      <div>
        <ThreeCircles
          visible={true}
          height="100"
          width="100"
          color="#a4f2ff"
          ariaLabel="three-circles-loading"
          wrapperStyle={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          wrapperClass=""
        />
      </div>
    );
  return (
    <div className={css.wrap}>
      <Modal isOpen={gameEnd} style={customStyles}>
        <>
          <h2>{winnerName}</h2>
          <h3>Счет: {winnerPts}</h3>
        </>
      </Modal>
      <div>
        <h1 className={css.title}>Страница ведущего</h1>
        <button
          onClick={handleStartGame}
          className={css.btn}
          disabled={!isButtonDisabled}
        >
          Старт
        </button>
        <button
          onClick={handleEndGame}
          className={css.btn}
          disabled={isButtonDisabled}
        >
          Конец игры
        </button>
      </div>
      <div>
        <Modal isOpen={isModalOpen} style={customStyles}>
          {isAnswering ? (
            <div className={css.modalPlayer}>
              <h2 className={css.menuTitle}>Имя игрока:</h2>
              <p className={css.playerName}>{playerName}</p>
              <div>
                <button onClick={handleGoodAnswer} className={css.btn}>
                  Верно! 🟢
                </button>
                <button onClick={handleBadAnswer} className={css.btn}>
                  Не верно! 🔴
                </button>
              </div>
            </div>
          ) : (
            <button onClick={handleChangeFrame} className={css.btn}>
              Следующий кадр ▶
            </button>
          )}
        </Modal>
      </div>
      {themes ? (
        <div>
          {Object.entries(themes).map(([theme, movies]) => (
            <div key={theme}>
              <strong className={css.playerName}>{theme}</strong>
              <div>
                {movies.movies.map((movie, index) => (
                  <div key={index}>
                    <button
                      className={css.btn}
                      onClick={(e) => {
                        socket.emit("get_frames", session, theme, movie.name);
                        socket.emit("start_round", session);
                        setIsModalOpen(true);
                        e.target.disabled = true;
                      }}
                    >
                      {`${movie.index + 1}: ${movie.name}`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ThreeCircles
          visible={!isButtonDisabled}
          height="100"
          width="100"
          color="#a4f2ff"
          ariaLabel="three-circles-loading"
          wrapperStyle={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          wrapperClass=""
        />
      )}
    </div>
  );
}
