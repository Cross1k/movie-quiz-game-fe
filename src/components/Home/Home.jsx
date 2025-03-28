import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import css from "./Home.module.css";
import { connectSocket, disconnectSocket, socket } from "../../utils/socket.js";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const players = [1, 2, 3];

  const [sessionId, setSessionId] = useState("");

  const navigate = useNavigate();
  // const findURL = window.location.href; // use it on prod

  useEffect(() => {
    connectSocket();
    socket.on("home_page", (data) => {
      setSessionId(String(data));
    });
    socket.on("broadcast_full_room", (room) => navigate(`/game/${room}`));
    return () => {
      // socket.off("home_page");
      socket.off("broadcast_full_room");
      // disconnectSocket();
    };
  }, [navigate]);

  return (
    <>
      <QRCodeCanvas
        className={css.qrcode}
        value={`192.168.3.6:5173/host/${sessionId}`}
        size={400}
        session={sessionId}
      />
      {players.map((player) => (
        <QRCodeCanvas
          className={css.qrcode}
          value={`192.168.3.6:5173/player/${player}/${sessionId}`}
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
