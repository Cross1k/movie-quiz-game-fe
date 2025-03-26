import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";

export default function Player() {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [playerName, setPlayerName] = useState(null);
  const [stateAnswer, setStateAnswer] = useState(null);

  const { id, session } = useParams();

  useEffect(() => {
    connectSocket();

    socket.emit("join_room", session);

    socket.on("broadcast_answer", (id) => {
      setPlayerName(id);
      setIsButtonDisabled(true);
    });

    socket.on("broadcast_good_answer", () => {
      setStateAnswer("Wright answer");
      setIsButtonDisabled(false);
      setPlayerName(null);
    });

    socket.on("broadcast_bad_answer", () => {
      setStateAnswer("Bad answer");
      setIsButtonDisabled(false);
      setPlayerName(null);
    });
    return () => {
      socket.off("broadcast_answer");
      socket.off("broadcast_good_answer");
      socket.off("broadcast_bad_answer");
      disconnectSocket();
    };
  }, [session]);

  const handleAnswer = () => {
    socket.emit("give_answer", { session, id });
    setIsButtonDisabled(true);
  };

  return (
    <>
      <h2>
        Player {id}, game {session}
      </h2>
      <button type="button" onClick={handleAnswer} disabled={isButtonDisabled}>
        Give answer 🔔
      </button>
      {playerName !== null && <h3>{playerName}</h3>}
      {stateAnswer !== null && <h3>{stateAnswer}</h3>}
    </>
  );
}
