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
  const [gameId, setGameId] = useState(localStorage.getItem("gameId") || null);
  const [winnerName, setWinnerName] = useState(null);
  const [winnerScore, setWinnerScore] = useState(null);
  const [equalPlayers, setEqualPlayers] = useState(null);
  const [gameEnd, setGameEnd] = useState(false);

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
    connectSocket();

    // socket.emit("game_page_id", session, socket.id);

    setTimeout(() => {
      console.log(socket.id);
      socket.emit("game_page_id", session, socket.id, gameId);
      socket.on("game_page_id_answer", (_id) => {
        setGameId(_id);
        localStorage.setItem("gameId", _id);
      });
    }, 500);

    socket.emit("get_themes");

    socket.on("themes_list", (themes) => {
      setThemes(themes);
    });

    socket.on("open_frame", (frame) => {
      setFrames(frame);
      setIsModalOpen(true);
      console.log("got frame", frame);
    });

    socket.on("change_frame", () => {
      setSelectedFrame(selectedFrame + 1);
    });

    socket.on("show_logo", () => {
      setPlayerAnswer("верно!");
      socket.emit(
        "send_points",
        5 - selectedFrame,
        session,
        playerName,
        socket.id
      );
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

    socket.on("all_points", (score) => {
      setScoreTable(score);
      console.log(score);
    });

    socket.on("broadcast_answer", (id) => {
      setPlayerName(id);
    });

    socket.on("broadcast_bad_answer", () => {
      setPlayerAnswer("не верно!");
      setTimeout(() => {
        setPlayerName(null);
        setPlayerAnswer(null);
      }, 4000);
    });

    socket.on("game_ended", (data) => {
      setWinnerName(data.name);
      setWinnerScore(data.score);
      setGameEnd(true);
    });

    socket.on("game_ended_tie", (data) => {
      setEqualPlayers(data);
    });

    return () => {
      disconnectSocket();
    };
  }, [session, selectedFrame, playerName, gameId]);

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
        {winnerName && (
          <>
            <h2> Победили {winnerName}</h2>

            <h3>Счет: {winnerScore}</h3>
          </>
        )}
        {equalPlayers && (
          <>
            <h2>Ничья!</h2>
            <ul>
              {equalPlayers.map((player) => (
                <li key={player.name}>
                  <h3>{player.name}</h3>
                  <h3>{player.score}</h3>
                </li>
              ))}
            </ul>
          </>
        )}
      </Modal>
      {scoreTable && (
        <>
          <h2>Таблица результатов</h2>
          <ul>
            {scoreTable.map((player) => (
              <li key={player.name}>
                <h3>{player.name}</h3>
                <h3>{player.score}</h3>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Выберите тему</h2>
      {themes != null && (
        <ul>
          {Object.keys(themes).map((theme) => (
            <li key={theme}>
              {theme}
              <ul>
                {themes[theme].movies.map((movie) => (
                  <li key={movie.index}>
                    <button
                      onClick={(e) => {
                        console.log(e.target.disabled);
                      }}
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
