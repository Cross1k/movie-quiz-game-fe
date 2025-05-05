import React, { useEffect, useState } from "react";
import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "react-modal";
import css from "./HostPage.module.css";
import Loader from "../../components/Loader/Loader.jsx";
import customStyles from "../../utils/customStyles.js";
import ModalWinner from "../../components/ModalWinner/ModalWinner.jsx";
import ModalAnswer from "../../components/ModalAnswer/ModalAnswer.jsx";

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
  const [IsNextFrameButtonDisabled, setIsNextFrameButtonDisabled] =
    useState(true);
  const [allBundles, setAllBundles] = useState(null);
  const [chosenBundle, setChosenBundle] = useState(null);

  const navigate = useNavigate();

  const { session } = useParams();

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

    socket.once("all_themes", (themes, bundleName) => {
      setIsButtonDisabled(false);
      setThemes(themes);
      setChosenBundle(bundleName);
      console.log(bundleName);
    });

    socket.on("all_bundles", (bundles) => {
      setAllBundles(bundles);
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
    setPlayerName(null);
    setIsNextFrameButtonDisabled(true);
    setTimeout(() => {
      setIsModalOpen(false);
      socket.emit("round_end", session);
      document.body.style.overflow = "";
    }, 3000);
  };

  const handleBadAnswer = () => {
    socket.emit("answer_no", session);
    setPlayerName(null);
    setIsAnswering(false);
  };
  const handleChangeFrame = () => {
    socket.emit("change_frame", session);
    setCount((p) => p + 1);
    if (count >= 5) {
      socket.emit("round_end", session);
      setCount(1);
      setIsAnswering(false);
      setIsNextFrameButtonDisabled(true);
      setPlayerName(null);

      setTimeout(() => {
        setIsModalOpen(false);
        document.body.style.overflow = "";
      }, 3000);
    }
  };

  const handleStartGame = () => {
    socket.emit("start_game", session, socketId);
    setIsButtonDisabled(false);
  };

  const handleEndGame = () => {
    socket.emit("end_game", session);
  };

  if (!socketId)
    return (
      <div>
        <Loader />
      </div>
    );
  return (
    <div className={css.wrap}>
      <h1 className={css.title}>Страница ведущего</h1>

      <ModalWinner
        winnerName={winnerName}
        winnerPts={winnerPts}
        gameEnd={gameEnd}
      />

      <ModalAnswer />

      {chosenBundle !== null ? (
        <>
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
                          disabled={movie.guessed}
                          onClick={(e) => {
                            socket.emit(
                              "get_frames",
                              session,
                              chosenBundle,
                              theme,
                              movie.name
                            );
                            socket.emit("start_round", session);
                            setIsModalOpen(true);
                            setIsNextFrameButtonDisabled(false);
                            e.target.disabled = true;
                            document.body.style.overflow = "hidden";
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
            <Loader />
          )}

          <div style={{ marginTop: "20px" }}>
            <button
              onClick={handleEndGame}
              className={css.btn}
              disabled={isButtonDisabled}
            >
              Конец игры
            </button>
          </div>
        </>
      ) : allBundles ? (
        <>
          <button
            onClick={handleStartGame}
            className={css.btn}
            disabled={!isButtonDisabled}
          >
            Старт
          </button>
          {!isButtonDisabled &&
            allBundles.map((bundle) => (
              <button
                key={bundle.name}
                className={css.btn}
                onClick={() => {
                  socket.emit("chose_bundle", session, bundle.name);
                  setChosenBundle(bundle.name);
                  console.log(bundle.name);
                }}
              >
                {bundle.name}
              </button>
            ))}
        </>
      ) : (
        <Loader />
      )}
    </div>
  );
}
