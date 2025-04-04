import React, { useEffect, useState } from "react";
import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "react-modal";
import css from "./GamePage.module.css";

const initialState = [
  { socketId: null, points: 0, name: "Черепашки" },
  { socketId: null, points: 0, name: "Черепушки" },
  { socketId: null, points: 0, name: "Черемушки" },
];

export default function Themes() {
  const [themes, setThemes] = useState([]);
  const [frames, setFrames] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [playerName, setPlayerName] = useState(null);
  const [playerAnswer, setPlayerAnswer] = useState(null);
  const [scoreTable, setScoreTable] = useState(initialState);
  const [gameEnd, setGameEnd] = useState(false);
  const [winnerName, setWinnerName] = useState(null);
  const [winnerPts, setWinnerPts] = useState(null);
  const [socketId, setSocketId] = useState(null);

  const navigate = useNavigate();

  const { session } = useParams();

  function getFileName(url) {
    const parts = url.split("/");
    const lastPart = parts[parts.length - 1];
    return lastPart.split("_")[0];
  }

  // Функция для извлечения числа из имени файла
  function getNumberFromFileName(fileName) {
    const match = fileName.match(/(\d+)pts/);
    return match ? parseInt(match[1]) : -1; // -1 для нечисловых значений
  }

  // Сортируем массив
  const sortedUrls = [...frames].sort((a, b) => {
    const fileNameA = getFileName(a);
    const fileNameB = getFileName(b);

    // Проверяем специальный случай для "logo" - помещаем его в конец
    if (fileNameA === "logo") return 1;
    if (fileNameB === "logo") return -1;

    // Извлекаем числа
    const numberA = getNumberFromFileName(fileNameA);
    const numberB = getNumberFromFileName(fileNameB);

    // Сортируем по убыванию (от большего к меньшему)
    return numberB - numberA;
  });

  const customStyles = {
    content: {
      padding: 0,
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#e4f2ff",
      // maxWidth: "90vw", // максимум 90% ширины окна
      // maxHeight: "90vh", // максимум 90% высоты окна
      // overflow: "auto", // прокрутка при переполнении
      // boxSizing: "border-box", // чтобы padding учитывался в размерах
    },
    overlay: {
      backgroundColor: "#rgba(228, 242, 255, 0.99)",
      backdropFilter: "blur(8px)",
    },
  };

  useEffect(() => {
    setTimeout(() => {
      setSocketId(socket.id);
      console.log(session, socketId);
      socket.emit("game_join_room", session, socketId);
      socket.emit("get_themes", session);
    }, 700);
  }, [socketId, session]);

  useEffect(() => {
    if (!session) return;

    socket.on("all_themes", (themes) => {
      setThemes(themes);
      console.log(themes);
    });

    socket.on("all_frames", (frame) => {
      setFrames(frame);
      setIsModalOpen(true);
    });

    socket.on("change_frame", () => {
      setSelectedFrame(selectedFrame + 1);
    });

    socket.on("all_points", (score) => {
      console.log("game received points");
      setScoreTable(score);
      console.log(score);
    });

    socket.on("player_answer", (playerName) => {
      setPlayerName(playerName);
      console.log("playerName", playerName);
    });

    socket.on("answer_yes", () => {
      setPlayerAnswer("верно!");
      setTimeout(() => {
        setPlayerName(null);
        setPlayerAnswer(null);
        setSelectedFrame(5);
      }, 1000);
      setTimeout(() => {
        setIsModalOpen(false);
        setSelectedFrame(0);
        setFrames([]);
      }, 5000);
      console.log("got logo");
    });

    socket.on("get_points", (playerName) => {
      socket.emit(
        "player_points",
        session,
        playerName,
        5 - selectedFrame,
        socket.id
      );
      console.log("emitted:", session, playerName, 5 - selectedFrame);
    });

    socket.on("answer_no", () => {
      setPlayerAnswer("не верно!");
      setTimeout(() => {
        setPlayerName(null);
        setPlayerAnswer(null);
      }, 3000);
    });

    socket.on("round_end", () => {
      setTimeout(() => {
        setIsModalOpen(false);
        setSelectedFrame(0);
        setFrames([]);
      }, 3000);
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
      socket.off("all_frames");
      socket.off("change_frame");
      socket.off("all_points");
      socket.off("player_answer");
      socket.off("answer_yes");
      socket.off("answer_no");
      socket.off("get_points");
      socket.off("all_themes");
    };
  }, [navigate, selectedFrame, session]);

  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <div className={css.wrap}>
      {frames.length > 0 && (
        <Modal isOpen={isModalOpen} style={customStyles}>
          {playerName ? (
            <div className={css.modalPlayer}>
              <h3 className={css.playerName}>
                Отвечают {playerName}
                {playerAnswer && ` - ${playerAnswer}`}
              </h3>
            </div>
          ) : (
            <img
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
              src={sortedUrls[selectedFrame]}
            />
          )}
        </Modal>
      )}
      <Modal isOpen={gameEnd} style={customStyles}>
        <div className={css.modalEnd}>
          <h2 className={css.menuTitle}>{winnerName}</h2>

          <h3 className={css.menuTitle}>Счет: {winnerPts}</h3>
        </div>
      </Modal>

      <h1 className={css.title}>Страница игры</h1>
      <h2 className={css.menuTitle}>Таблица результатов</h2>
      <div className={css.scoreTable}>
        {scoreTable.map((player) => (
          <div key={player.name} className={css.playerWrap}>
            <h3 className={css.playerName}>{player.name}</h3>
            <h3 className={css.playerName}>{player.points}</h3>
          </div>
        ))}
      </div>

      {themes != null && (
        <>
          <h2 className={css.menuTitle}>Выберите тему</h2>
          <div className={css.themeTable}>
            {Object.entries(themes).map(([theme, movies]) => (
              <div key={theme} className={css.themeWrap}>
                <h3 className={css.playerName}>{theme}</h3>
                <div className={css.moviesWrap}>
                  {movies.movies.map((movie, index) => (
                    <div key={index} className={css.btnWrap}>
                      <button disabled={movie.guessed} className={css.btn}>
                        {!movie.guessed
                          ? `${movie.index + 1}`
                          : `${movie.name}`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
