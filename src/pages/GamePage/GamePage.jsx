import React, { useEffect, useMemo, useState } from "react";

import Modal from "react-modal";
import Confetti from "react-confetti";
import { useNavigate, useParams } from "react-router-dom";

import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";
import css from "./GamePage.module.css";
// import ModalWinner from "../../components/ModalWinner/ModalWinner.jsx";
import customStyles from "../../utils/customStyles.js";
import Loader from "../../components/Loader/Loader.jsx";

export default function GamePage() {
  const { session } = useParams();
  const navigate = useNavigate();

  const [themes, setThemes] = useState({});
  const [frames, setFrames] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [playerName, setPlayerName] = useState(null);
  const [playerAnswer, setPlayerAnswer] = useState(null);
  const [scoreTable, setScoreTable] = useState(null);
  const [gameEnd, setGameEnd] = useState(false);
  const [winnerName, setWinnerName] = useState(null);
  const [winnerPts, setWinnerPts] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [allBundles, setAllBundles] = useState(null);
  const [chosenBundle, setChosenBundle] = useState(null);

  const getFileName = (url) => url.split("/").pop().split("_")[0];

  const sortedUrls = useMemo(
    () =>
      frames.length > 0 &&
      [...frames].sort((a, b) => {
        const fileNameA = getFileName(a);
        const fileNameB = getFileName(b);

        if (fileNameA === "logo") return 1;
        if (fileNameB === "logo") return -1;

        const numberA = parseInt(fileNameA.match(/\d+/)[0] || -1, 10);
        const numberB = parseInt(fileNameB.match(/\d+/)[0] || -1, 10);

        return numberB - numberA;
      }),
    [frames]
  );

  // const customStyles = useMemo(styles, []);

  useEffect(() => {
    setTimeout(() => {
      setSocketId(socket.id);
      if (!socket.connected) return;
      socket.emit("game_join_room", session, socketId);
      // socket.emit("get_themes", session);
    }, 400);
  }, [socketId, session]);

  useEffect(() => {
    if (!session) return;
    // if (!socket.connected) return;

    socket.on("all_bundles", (bundles) => setAllBundles(bundles));
    socket.on("all_themes", (themes, bundleName) => {
      setThemes(themes);
      setChosenBundle(bundleName);
    });

    socket.on("all_frames", (frame) => {
      setFrames(frame);
      setIsModalOpen(true);
    });

    // socket.on("start_game", (bundleName) => {
    //   setChosenBundle(bundleName);
    // });

    socket.on("change_frame", () => setSelectedFrame((prev) => prev + 1));

    socket.on("all_points", (score) => setScoreTable(score));

    socket.on("player_answer", (playerName) => setPlayerName(playerName));

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
    });

    socket.on("answer_no", () => {
      setPlayerAnswer("не верно!");
      setTimeout(() => {
        setPlayerName(null);
        setPlayerAnswer(null);
      }, 3000);
    });

    socket.on("get_points", (playerName) => {
      socket.emit(
        "player_points",
        session,
        playerName,
        5 - selectedFrame,
        socket.id
      );
    });

    socket.on("round_end", () => {
      setTimeout(() => {
        setIsModalOpen(false);
        setSelectedFrame(0);
        setFrames([]);
      }, 3000);
      socket.emit("get_themes", session);
    });

    socket.on("end_game", (winner, pts) => {
      setWinnerName(winner);
      setWinnerPts(pts);
      setGameEnd(true);
      setTimeout(() => {
        navigate("/");
      }, 6000);
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
  }, [navigate, selectedFrame, session, themes]);

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
          <Confetti numberOfPieces={1700} className={css.conf} />
          <h2 className={css.menuTitle}>Поздравляем!</h2>
          <h2 className={css.menuTitle}>{winnerName}!</h2>
          <h3 className={css.menuTitle}>Счет: {winnerPts}!</h3>
        </div>
      </Modal>

      <h1 className={css.title}>Страница игры</h1>
      {chosenBundle !== null ? (
        <>
          <h2 className={css.menuTitle}>Таблица результатов</h2>
          <div className={css.scoreTable}>
            {scoreTable &&
              scoreTable.map((player) => (
                <div key={player.name} className={css.playerWrap}>
                  <h3 className={css.playerName}>
                    {player.name} {player.logo}
                  </h3>
                  <h3 className={css.playerName}>{player.points}</h3>
                </div>
              ))}
          </div>
          <h2 className={css.menuTitle}>Выберите тему</h2>
          {Object.keys(themes).length > 0 ? (
            <>
              <div className={css.themeTable}>
                {Object.entries(themes).map(([theme, movies]) => (
                  <div key={theme} className={css.themeWrap}>
                    <h3 className={css.playerName}>{theme}</h3>
                    <div className={css.moviesWrap}>
                      {movies.movies.map((movie, index) => (
                        <div key={index} className={css.btnWrap}>
                          <button disabled={movie.guessed} className={css.btn}>
                            {movie.guessed
                              ? movie.whoGuessed === null
                                ? "💤"
                                : movie.whoGuessed
                              : movie.index + 1}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Loader />
          )}
        </>
      ) : allBundles ? (
        <>
          {" "}
          <h2 className={css.menuTitle}>Выбор темы</h2>
          <div className={css.scoreTable}>
            {allBundles.map((bundle) => (
              <button key={bundle.name} className={css.themes}>
                {bundle.name}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div>
          <Loader />
        </div>
      )}
    </div>
  );
}
