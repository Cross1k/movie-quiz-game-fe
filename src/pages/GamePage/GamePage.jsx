import React, { useEffect, useState } from "react";
import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";
import { useParams } from "react-router-dom";
import Modal from "react-modal";
// import { useNavigate } from "react-router-dom";

export default function Themes() {
  const [themes, setThemes] = useState([]);
  const [frames, setFrames] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [playerName, setPlayerName] = useState(null);
  const [playerAnswer, setPlayerAnswer] = useState(null);
  const [scoreTable, setScoreTable] = useState(null);
  const [gameId, setGameId] = useState(localStorage.getItem("gameId") || null);

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
    // socket.emit("game_join_room", session);

    setTimeout(() => {
      socket.emit("game_join_room", session, socket.id, gameId);
      socket.on("game_joined_room", (_id) => {
        if (_id === gameId) return;
        setGameId(_id);
        localStorage.setItem("gameId", _id);
      });
    }, 400);

    socket.emit("get_themes");

    socket.on("all_themes", (themes) => {
      setThemes(themes);
    });

    socket.on("all_frames", (frame) => {
      setFrames(frame);
      setIsModalOpen(true);
      console.log("got frame", frame);
    });

    socket.on("change_frame", () => {
      setSelectedFrame(selectedFrame + 1);
    });

    socket.on("answer_yes", () => {
      setPlayerAnswer("верно!");
      socket.emit(
        "get_points",
        session,
        playerName,
        5 - selectedFrame,
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

    socket.on("player_answer", (id) => {
      setPlayerName(id);
    });

    socket.on("answer_no", () => {
      setPlayerAnswer("не верно!");
      setTimeout(() => {
        setPlayerName(null);
        setPlayerAnswer(null);
      }, 4000);
    });
  }, [session, selectedFrame, playerName]);

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
