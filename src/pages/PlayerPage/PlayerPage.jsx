import React, { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";
import Modal from "react-modal";
import Confetti from "react-confetti";

import css from "./PlayerPage.module.css";

import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";
import HashLoader from "react-spinners/HashLoader.js";
import customStyles from "../../utils/customStyles.js";
import { useDispatch, useSelector } from "react-redux";

export default function Player() {
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [playerName, setPlayerName] = useState(null);
  const [stateAnswer, setStateAnswer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myPoints, setMyPoints] = useState(0);
  const [winnerName, setWinnerName] = useState(null);
  const [winnerPts, setWinnerPts] = useState(null);
  const [gameEnd, setGameEnd] = useState(false);
  const [socketId, setSocketId] = useState(null);

  const playerId = useSelector((state) => state.players.players);

  const dispatch = useDispatch();

  const { id, session } = useParams();
  const navigate = useNavigate();

  useMemo(() => {
    id, session;
  }, [id, session]);

  const names = useMemo(() => ["Черепашки", "Черепушки", "Черемушки"], []);

  useEffect(() => {
    setTimeout(() => {
      setSocketId(socket.id);
      if (socketId) {
        socket.emit("player_join_room", session, names[id - 1], id, socketId);
        socket.emit("round_request", session);
        socket.emit("who_answer", session);
      }
    }, 600);
  }, [id, names, session, socketId]);

  useEffect(() => {
    socket.on("is_started", (bool) => {
      setIsButtonDisabled(!bool);
    });

    socket.on("who_answer", (name) => {
      if (name === null) return;
      setPlayerName(name);
      setIsButtonDisabled(true);
      setIsModalOpen(true);
    });

    socket.on("player_answer", (id) => {
      setPlayerName(id);
      setIsButtonDisabled(true);
      setIsModalOpen(true);
    });

    socket.on("your_points", (pts) => {
      setMyPoints(pts);
    });

    socket.on("answer_yes", () => {
      setStateAnswer("верно!");
      setIsButtonDisabled(true);
      setTimeout(() => {
        setPlayerName(null);
        setStateAnswer(null);
        setIsModalOpen(false);
      }, 6000);
    });

    socket.on("answer_no", () => {
      setStateAnswer("не верно!");
      setTimeout(() => {
        setPlayerName(null);
        setStateAnswer(null);
        setIsModalOpen(false);
      }, 3000);
      setIsButtonDisabled(false);
    });

    socket.on("start_round", () => {
      setIsButtonDisabled(false);
    });

    socket.on("round_end", () => {
      setIsButtonDisabled(true);
      setTimeout(() => {
        setPlayerName(null);
        setStateAnswer(null);
        setIsModalOpen(false);
      }, 3000);
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
      socket.off("player_answer");
      socket.off("your_points");
      socket.off("answer_yes");
      socket.off("answer_no");
      socket.off("end_game");
      socket.off("start_round");
      socket.off("round_end");
    };
  }, [id, names, navigate, session]);

  useEffect(() => {
    if (!socket.connected) {
      setTimeout(() => {
        connectSocket();
      }, 500);
    }

    return () => {
      disconnectSocket();
    };
  }, [session]);

  const handleAnswer = () => {
    if (socketId) {
      socket.emit("player_answer", session, names[id - 1]);
      setIsButtonDisabled(true);
    }
  };

  if (!socketId) {
    return (
      <div>
        <HashLoader
          size={100}
          color="#aabbff"
          speedMultiplier={0.85}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "rotate(20deg)",
          }}
        />
      </div>
    );
  }

  return (
    <div className={css.wrap}>
      <Modal isOpen={gameEnd} style={customStyles}>
        <>
          <Confetti className={css.conf} numberOfPieces={2000} />
          <h2>Победитель</h2>
          <h2>{winnerName}</h2>
          <h3>Счет: {winnerPts}</h3>
        </>
      </Modal>
      <Modal style={customStyles} isOpen={isModalOpen}>
        <div className={css.modalPlayer}>
          <p className={css.answer}>
            Отвечают {playerName} {stateAnswer && `- ${stateAnswer}`}
          </p>
        </div>
      </Modal>
      <h1 className={css.title}>Команда {names[id - 1]}</h1>
      <button
        type="button"
        onClick={handleAnswer}
        disabled={isButtonDisabled}
        className={css.btn}
      >
        Я знаю!!! 🔔
      </button>
      <p className={css.menuTitle}>У нас {myPoints} очков</p>
    </div>
  );
}
