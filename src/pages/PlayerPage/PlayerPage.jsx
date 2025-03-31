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
  const [playerId, setPlayerId] = useState(
    localStorage.getItem("playerId") || null
  );

  const { id, session } = useParams();

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
    socket.emit("join_room", session);

    setTimeout(() => {
      console.log(socket.id);
      socket.emit("player_page_id", socket.id, playerId);
      socket.on("player_page_id_answer", (_id) => {
        if (_id === playerId) return;
        setPlayerId(_id);
        localStorage.setItem("playerId", _id);
        console.log(_id);
      });
    }, 500);

    socket.on("broadcast_answer", (id) => {
      setPlayerName(id);
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
      }, 5000);
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
      }, 5000);
    });
    return () => {
      socket.off("broadcast_answer");
      socket.off("broadcast_good_answer");
      socket.off("broadcast_bad_answer");
    };
  }, [session, playerId]);

  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  const handleAnswer = () => {
    socket.emit("give_answer", session, id);
    setIsButtonDisabled(true);
  };

  return (
    <>
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
