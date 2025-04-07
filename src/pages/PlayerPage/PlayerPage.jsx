import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "react-modal";

import css from "./PlayerPage.module.css";

import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";

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

  const { id, session } = useParams();

  const navigate = useNavigate();

  useMemo(() => {
    id, session;
  }, [id, session]);

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

  const names = useMemo(() => ["Черепашки", "Черепушки", "Черемушки"], []);

  useEffect(() => {
    setTimeout(() => {
      setSocketId(socket.id);
      console.log(socketId);
      if (socketId) {
        socket.emit("player_join_room", session, names[id - 1], socketId);
        socket.emit("round_request", session);
        socket.emit("who_answer", session);
      }
    }, 600);
  }, [id, names, session, socketId]);

  useEffect(() => {
    socket.on("is_started", (bool) => {
      setIsButtonDisabled(!bool);
      console.log("round is", bool);
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
      }, 4000);
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
    return <div>Loading...</div>;
  }

  return (
    <div className={css.wrap}>
      <Modal isOpen={gameEnd} style={customStyles}>
        <>
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
