import React, { useEffect, useMemo, useState } from "react";

import Modal from "react-modal";
import Confetti from "react-confetti";

import css from "./PlayerPage.module.css";

import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";
import customStyles from "../../utils/customStyles.js";
import { useDispatch, useSelector } from "react-redux";
import { selectModal } from "../../redux/common/selectors.js";
import { setPlayer } from "../../redux/players/selectors.js";
import { useNavigate, useParams } from "react-router-dom";
import { selectStartButton } from "../../redux/host/selectors.js";
import { startButton } from "../../redux/host/slice.js";
import { setPlayerAnswer } from "../../redux/game/slice.js";
import Loader from "../../components/Loader/Loader.jsx";
import { setPlayerId } from "../../redux/players/slice.js";

export default function Player() {
  const dispatch = useDispatch();
  const { id, session } = useParams();
  const navigate = useNavigate();

  const [gameEnd, setGameEnd] = useState(false);

  const player = useSelector(setPlayer);
  const isModalOpen = useSelector(selectModal);
  const button = useSelector(selectStartButton);
  const playerName = useSelector((state) => state.players.player.name);
  const myPoints = useSelector((state) => state.players.player.points);
  const stateAnswer = useSelector((state) => state.game.playerAnswer);
  const winnerName = useSelector((state) => state.game.winnerName);
  const winnerPts = useSelector((state) => state.game.winnerPts);
  const socketId = useSelector((state) => state.players.player.socketId);

  const names = useMemo(() => ["Черепашки", "Черепушки", "Черемушки"], []);

  useEffect(() => {
    setTimeout(() => {
      dispatch(setPlayerId(socket.id));
      console.log(player);
      if (player.socketId === null) {
        socket.emit("player_join_room", session, names[id - 1], id, socketId);
        socket.emit("round_request", session);
        socket.emit("who_answer", session);
      }
    }, 600);
  }, [dispatch, id, names, player, session, socketId]);

  useEffect(() => {
    socket.on("is_started", (bool) => {
      dispatch(startButton(!bool)); // button
    });

    socket.on("who_answer", (name) => {
      if (name === null) return;
      dispatch(player.playerName(name));
      dispatch(startButton(true));
      dispatch(selectModal(true));
    });

    socket.on("player_answer", (id) => {
      dispatch(player.playerName(id));
      dispatch(startButton(true));
      dispatch(selectModal(true));
    });

    socket.on("your_points", (pts) => {
      dispatch(player.points(pts));
    });

    socket.on("answer_yes", () => {
      dispatch(setPlayerAnswer("верно!"));
      dispatch(startButton(true));
      setTimeout(() => {
        dispatch(player.playerName(null));
        dispatch(setPlayerAnswer(null));
        dispatch(selectModal(false));
      }, 6000);
    });

    socket.on("answer_no", () => {
      dispatch(setPlayerAnswer("не верно!"));
      setTimeout(() => {
        dispatch(player.playerName(null));
        dispatch(setPlayerAnswer(null));
        dispatch(selectModal(false));
      }, 3000);
      dispatch(startButton(false));
    });

    socket.on("start_round", () => {
      dispatch(startButton(false));
    });

    socket.on("round_end", () => {
      dispatch(startButton(true));
      setTimeout(() => {
        dispatch(player.playerName(null));
        dispatch(setPlayerAnswer(null));
        dispatch(selectModal(false));
      }, 3000);
    });

    socket.on("end_game", (winner, pts) => {
      dispatch(setWinnerName(winner));
      dispatch(setWinnerPts(pts));
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
  }, [dispatch, navigate, player]);

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
      dispatch(selectModal(true));
    }
  };

  if (!socketId) {
    return (
      <div>
        <Loader />
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
        disabled={button}
        className={css.btn}
      >
        Я знаю!!! 🔔
      </button>
      <p className={css.menuTitle}>У нас {myPoints} очков</p>
    </div>
  );
}
