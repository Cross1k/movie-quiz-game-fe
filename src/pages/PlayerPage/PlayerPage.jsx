import React, { useEffect, useState } from "react";
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
  const [playerId, setPlayerId] = useState(
    localStorage.getItem("playerId") || null
  );

  const { id, session } = useParams();

  const names = React.useMemo(
    () => ["Черепашки", "Черепушки", "Черемушки"],
    []
  );

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
    setTimeout(() => {
      {
        console.log(socket.id);
        socket.emit("join_room", session, socket.id, playerId, names[id - 1]);
        socket.on("host_page_id_answer", (_id) => {
          setPlayerId(_id);
          localStorage.setItem("playerId", _id);
        });
      }
    }, 500);

    socket.on("broadcast_answer", (PlayerName) => {
      setPlayerName(PlayerName);
      setIsButtonDisabled(true);
      setIsModalOpen(true);
    });

    socket.on("show_logo", () => {
      setStateAnswer("верно!");
      setTimeout(() => {
        setIsButtonDisabled(false);
        setPlayerName(null);
        setStateAnswer(null);
        setIsModalOpen(false);
      }, 6000);
    });

    socket.on("your_points", (pts) => {
      setMyPoints(pts);
    });

    socket.on("broadcast_bad_answer", () => {
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
    return () => {
      socket.off("broadcast_answer");
      socket.off("broadcast_good_answer");
      socket.off("broadcast_bad_answer");
      disconnectSocket();
    };
  }, [session, names, id, playerId]);

  const handleAnswer = () => {
    socket.emit("give_answer", session, playerName);
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
      <h2>Команда {id}</h2>
      <button type="button" onClick={handleAnswer} disabled={isButtonDisabled}>
        Я знаю!!! 🔔
      </button>
      <p>У нас {myPoints} очков</p>
    </>
  );
}
