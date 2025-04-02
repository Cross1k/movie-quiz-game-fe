import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import css from "./Home.module.css";
import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const players = [1, 2, 3];

  const [sessionId, setSessionId] = useState("");

  const navigate = useNavigate();
  const findURL = window.location.href; // use it on prod

  useEffect(() => {
    connectSocket();
    setTimeout(() => {
      console.log("my id:", socket.id);

      socket.emit("create_session", socket.id);
      setSessionId(socket.id);
      // socket.emit("join_room", socket.id);
    }, 400);

    socket.on("start_game", (room) => navigate(`/game/${room}`));
    return () => {
      socket.off("home_page");
      socket.off("start_game");

      disconnectSocket();
    };
  }, [navigate]);

  return (
    <>
      <QRCodeCanvas
        className={css.qrcode}
        value={`${findURL}/host/${sessionId}`}
        // value={`http://192.168.88.73:5173/host/${sessionId}`}
        size={400}
        session={sessionId}
      />
      {players.map((player) => (
        <QRCodeCanvas
          className={css.qrcode}
          value={`${findURL}/player/${player}/${sessionId}`}
          // value={`http://192.168.88.73:5173/player/${player}/${sessionId}`}
          key={player}
          size={200}
          number={player}
          session={sessionId}
        />
      ))}
    </>
  );
};
export default Home;
