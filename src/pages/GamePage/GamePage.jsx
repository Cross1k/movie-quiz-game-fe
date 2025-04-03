import React, { useEffect, useState } from "react";
import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";
import { useParams } from "react-router-dom";
import Modal from "react-modal";

export default function Themes() {
  const [themes, setThemes] = useState([]);
  const [frames, setFrames] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [playerName, setPlayerName] = useState(null);
  const [playerAnswer, setPlayerAnswer] = useState(null);
  const [scoreTable, setScoreTable] = useState(null);
  const [gameEnd, setGameEnd] = useState(false);
  const [winnerName, setWinnerName] = useState(null);
  const [winnerPts, setWinnerPts] = useState(null);

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
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
  };

  useEffect(() => {
    if (!session) return;

    setTimeout(() => {
      socket.emit("game_join_room", session, socket.id);
      console.log(session, socket.id);
      socket.emit("get_themes", session);
    }, 600);

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

    socket.on("answer_yes", (playerName) => {
      setPlayerAnswer("верно!");
      setPlayerName(playerName);
      // setThemes(themes);
      // updateMovieStatus(theme, movie, playerName);
      setTimeout(() => {
        setPlayerName(null);
        setPlayerAnswer(null);
        setSelectedFrame(5);
        setTimeout(() => {
          setIsModalOpen(false);
          setSelectedFrame(0);
          setFrames([]);
        }, 3000);
      }, 3000);
      console.log("got logo");
    });

    socket.on("get_points", (playerName) => {
      socket.emit(
        "player_points",
        session,
        playerName,
        5 - selectedFrame,
        socket.id
        // selectedTheme,
        // selectedMovie
      );
      console.log("emitted:", session, playerName, 5 - selectedFrame);
    });

    socket.on("answer_no", () => {
      setPlayerAnswer("не верно!");
      setTimeout(() => {
        setPlayerName(null);
        setPlayerAnswer(null);
      }, 4000);
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
  }, [selectedFrame, session]);

  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <div>
      {frames.length > 0 && (
        <Modal isOpen={isModalOpen} style={customStyles}>
          {playerName ? (
            <p>
              Отвечает {playerName}
              {playerAnswer && ` - ${playerAnswer}`}
            </p>
          ) : (
            <img src={sortedUrls[selectedFrame]} />
          )}
        </Modal>
      )}
      <Modal isOpen={gameEnd} style={customStyles}>
        <>
          <h2>{winnerName}</h2>

          <h3>Счет: {winnerPts}</h3>
        </>
      </Modal>
      {scoreTable && (
        <>
          <h2>Таблица результатов</h2>
          <ul>
            {scoreTable.map((player) => (
              <li key={player.name}>
                <h3>{player.name}</h3>
                <h3>{player.points}</h3>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Выберите тему</h2>
      {themes != null && (
        <ul>
          {Object.entries(themes).map(([theme, movies]) => (
            <li key={theme}>
              {theme}
              <ul>
                {movies.movies.map((movie, index) => (
                  <li key={index}>
                    <button
                      onClick={(e) => {
                        console.log(e.target.disabled);
                      }}
                      disabled={movie.guessed}
                    >
                      {!movie.guessed ? `${movie.index + 1}` : `${movie.name}`}
                    </button>
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
