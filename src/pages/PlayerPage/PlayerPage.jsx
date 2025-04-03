import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Modal from "react-modal";

import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";

export default function Player() {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [playerName, setPlayerName] = useState(null);
  const [stateAnswer, setStateAnswer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myPoints, setMyPoints] = useState(0);
  const [winnerName, setWinnerName] = useState(null);
  const [winnerScore, setWinnerScore] = useState(null);
  const [equalPlayers, setEqualPlayers] = useState(null);
  const [gameEnd, setGameEnd] = useState(false);
  // const [playerId, setPlayerId] = useState(
  //   localStorage.getItem("playerId") || null
  // );

  const { id, session } = useParams();

  // const names = React.useMemo(
  //   () => ["Черепашки", "Черепушки", "Черемушки"],
  //   []
  // );

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

  const names = ["Черепашки", "Черепушки", "Черемушки"];

  // useMemo(() => {
  //   session;
  // }, [session]);

  useEffect(() => {
    setTimeout(() => {
      console.log(socket.id);
      socket.emit(
        "player_join_room",
        session,
        names[id - 1],
        socket.id
        // playerId
      );
      // socket.on("player_joined_room", (_id) => {
      //   if (_id === playerId) return;
      //   setPlayerId(_id);
      //   localStorage.setItem("playerId", _id);
      //   console.log(_id);
      // });
    }, 600);

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
      setTimeout(() => {
        setIsButtonDisabled(false);
        setPlayerName(null);
        setStateAnswer(null);
        setIsModalOpen(false);
      }, 6000);
    });

    socket.on("answer_no", () => {
      setStateAnswer("не верно!");
      setTimeout(() => {
        setIsButtonDisabled(false);
        setPlayerName(null);
        setStateAnswer(null);
        setIsModalOpen(false);
      }, 6000);
    });

    socket.on("game_ended", (data) => {
      setWinnerName(data.name);
      setWinnerScore(data.score);
      setGameEnd(true);
    });

    socket.on("game_ended_tie", (data) => {
      setEqualPlayers(data);
    });

    socket.on("start_round", () => {
      setIsButtonDisabled(false);
    });

    socket.on("round_end", () => {
      setIsButtonDisabled(true);
      setPlayerName(null);
      setStateAnswer(null);
      setIsModalOpen(false);
    });

    return () => {
      // socket.off("player_join_room");
      socket.off("player_answer");
      socket.off("your_points");
      socket.off("answer_yes");
      socket.off("answer_no");
      socket.off("game_ended");
      socket.off("game_ended");
      socket.off("game_ended");
      socket.off("game_ended_tie");
      socket.off("start_round");
      socket.off("round_end");
    };
  }, [id, names, session]);

  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, [session]);

  const handleAnswer = () => {
    socket.emit("player_answer", session, names[id - 1]);
    setIsButtonDisabled(true);
  };

  return (
    <>
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
      <Modal style={customStyles} isOpen={isModalOpen}>
        Отвечает {playerName} {stateAnswer && `- ${stateAnswer}`}
      </Modal>
      <h2>Команда {names[id - 1]}</h2>
      <button type="button" onClick={handleAnswer} disabled={isButtonDisabled}>
        Я знаю!!! 🔔
      </button>
      <p>У нас {myPoints} очков</p>
    </>
  );
}
